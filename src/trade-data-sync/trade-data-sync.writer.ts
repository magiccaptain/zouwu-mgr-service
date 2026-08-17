import fs from 'fs';

import { Injectable } from '@nestjs/common';
import { Side, TradeDataType } from '@prisma/client';

import { GetMarketByTicker } from 'src/lib/stock';
import { PrismaService } from 'src/prisma/prisma.service';

import { WRITE_CHUNK_SIZE, WriteUnitInput } from './trade-data-sync.types';

type RawPosition = {
  ticker: string;
  total_qty: number;
  sellable_qty: number;
};

type RawOrder = {
  order_api_id: number;
  order_ref: number;
  ticker: string;
  price: number;
  quantity: number;
  price_type: number;
  side: number;
  qty_left: number;
  insert_time: number;
  update_time: number;
  cancel_time: number;
  status: number;
};

type RawTrade = {
  ticker: string;
  order_api_id: number;
  order_ref: number;
  trade_id: string;
  trade_price: number;
  trade_quantity: number;
  trade_time: number;
  side: number;
};

type RawFund = {
  balance: number;
  buying_power: number;
  frozen: number;
  xtp_account?: object;
  atp_account?: object;
};

function mapSide(sideCode: number): Side | null {
  const sideChar = String.fromCharCode(sideCode);
  if (sideChar === 'B') {
    return Side.BUY;
  }
  if (sideChar === 'S') {
    return Side.SELL;
  }
  return null;
}

@Injectable()
export class TradeDataSyncWriter {
  constructor(private readonly prisma: PrismaService) {}

  async write(input: WriteUnitInput): Promise<void> {
    if (input.dataType === TradeDataType.FUND && input.reason == null) {
      throw new Error('reason is required when dataType is FUND');
    }

    const raw = fs.readFileSync(input.localFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    await this.prisma.$transaction(async (tx: any) => {
      switch (input.dataType) {
        case TradeDataType.POSITION:
          await this.replacePositions(tx, input, parsed as RawPosition[]);
          break;
        case TradeDataType.ORDER:
          await this.replaceOrders(tx, input, parsed as RawOrder[]);
          break;
        case TradeDataType.TRADE:
          await this.replaceTrades(tx, input, parsed as RawTrade[]);
          break;
        case TradeDataType.FUND:
          await this.replaceFund(tx, input, parsed as RawFund);
          break;
      }
    });
  }

  private async createManyInChunks(
    createMany: (args: { data: unknown[] }) => Promise<unknown>,
    data: unknown[]
  ) {
    if (data.length === 0) {
      return;
    }
    for (let i = 0; i < data.length; i += WRITE_CHUNK_SIZE) {
      await createMany({ data: data.slice(i, i + WRITE_CHUNK_SIZE) });
    }
  }

  private dayWhere(input: WriteUnitInput) {
    return {
      tradeDay: input.tradeDay,
      fundAccount: input.fundAccount,
      market: input.market,
    };
  }

  private accountKeys(input: WriteUnitInput) {
    return {
      brokerKey: input.brokerKey,
      productKey: input.productKey,
      companyKey: input.companyKey,
    };
  }

  private async replacePositions(
    tx: any,
    input: WriteUnitInput,
    positions: RawPosition[]
  ) {
    await tx.position.deleteMany({ where: this.dayWhere(input) });
    const data = positions
      .filter((p) => GetMarketByTicker(p.ticker) === input.market)
      .map((p) => ({
        ...this.dayWhere(input),
        ...this.accountKeys(input),
        ticker: p.ticker,
        totalQty: p.total_qty,
        sellableQty: p.sellable_qty,
      }));
    await this.createManyInChunks((args) => tx.position.createMany(args), data);
  }

  private async replaceOrders(
    tx: any,
    input: WriteUnitInput,
    orders: RawOrder[]
  ) {
    await tx.order.deleteMany({ where: this.dayWhere(input) });
    const data = [];
    for (const o of orders) {
      const side = mapSide(o.side);
      if (!side) {
        continue;
      }
      data.push({
        ...this.dayWhere(input),
        ...this.accountKeys(input),
        ticker: o.ticker,
        orderApiId: BigInt(o.order_api_id),
        orderRef: o.order_ref,
        price: o.price,
        quantity: o.quantity,
        priceType: o.price_type,
        side,
        qtyTraded: o.quantity - o.qty_left,
        qtyLeft: o.qty_left,
        insertTime: BigInt(o.insert_time),
        updateTime: BigInt(o.update_time),
        cancelTime: BigInt(o.cancel_time),
        status: o.status,
      });
    }
    await this.createManyInChunks((args) => tx.order.createMany(args), data);
  }

  private async replaceTrades(
    tx: any,
    input: WriteUnitInput,
    trades: RawTrade[]
  ) {
    await tx.trade.deleteMany({ where: this.dayWhere(input) });
    const data = [];
    for (const t of trades) {
      const side = mapSide(t.side);
      if (!side) {
        continue;
      }
      data.push({
        ...this.dayWhere(input),
        ...this.accountKeys(input),
        ticker: t.ticker,
        tradeId: t.trade_id,
        orderApiId: BigInt(t.order_api_id),
        orderRef: t.order_ref,
        price: t.trade_price,
        quantity: t.trade_quantity,
        tradeTime: BigInt(t.trade_time),
        tradeAmount: t.trade_price * t.trade_quantity,
        side,
      });
    }
    await this.createManyInChunks((args) => tx.trade.createMany(args), data);
  }

  private async replaceFund(tx: any, input: WriteUnitInput, snapshot: RawFund) {
    await tx.innerFundSnapshot.deleteMany({
      where: {
        trade_day: input.tradeDay,
        fund_account: input.fundAccount,
        market: input.market,
        reason: input.reason,
      },
    });
    await tx.innerFundSnapshot.create({
      data: {
        market: input.market,
        fund_account: input.fundAccount,
        reason: input.reason,
        balance: snapshot.balance,
        buying_power: snapshot.buying_power,
        frozen: snapshot.frozen,
        trade_day: input.tradeDay,
        xtp_account: snapshot.xtp_account,
        atp_account: snapshot.atp_account,
      },
    });
  }
}
