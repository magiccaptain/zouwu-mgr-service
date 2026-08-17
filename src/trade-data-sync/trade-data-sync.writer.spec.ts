import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  InnerFundSnapshotReason,
  Market,
  OpsTaskType,
  Side,
  TradeDataType,
} from '@prisma/client';

import { localTradeDataFile } from './trade-data-sync.paths';
import { WRITE_CHUNK_SIZE } from './trade-data-sync.types';
import { TradeDataSyncWriter } from './trade-data-sync.writer';

describe('TradeDataSyncWriter', () => {
  let tx: {
    position: { deleteMany: jest.Mock; createMany: jest.Mock };
    order: { deleteMany: jest.Mock; createMany: jest.Mock };
    trade: { deleteMany: jest.Mock; createMany: jest.Mock };
    innerFundSnapshot: { deleteMany: jest.Mock; create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock };
  let tmpDirs: string[];

  const baseInput = {
    tradeDay: '2026-08-17',
    fundAccount: 'ACC1',
    market: Market.SH,
    brokerKey: 'b',
    productKey: 'p',
    companyKey: 'c',
  };

  beforeEach(() => {
    tmpDirs = [];
    tx = {
      position: { deleteMany: jest.fn(), createMany: jest.fn() },
      order: { deleteMany: jest.fn(), createMany: jest.fn() },
      trade: { deleteMany: jest.fn(), createMany: jest.fn() },
      innerFundSnapshot: { deleteMany: jest.fn(), create: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn(async (fn: any) => fn(tx)),
    };
  });

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function writeFixture(filename: string, data: unknown): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tds-'));
    tmpDirs.push(dir);
    const file = path.join(dir, filename);
    fs.writeFileSync(file, JSON.stringify(data));
    return file;
  }

  it('replaces positions for the day and drops tickers absent from the file', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tds-'));
    tmpDirs.push(dir);
    const file = path.join(dir, 'position.SH.json');
    fs.writeFileSync(
      file,
      JSON.stringify([
        { ticker: '600000.SH', total_qty: 100, sellable_qty: 80 },
        { ticker: '000001.SZ', total_qty: 50, sellable_qty: 50 },
      ])
    );
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      dataType: TradeDataType.POSITION,
      tradeDay: '2026-08-17',
      fundAccount: 'ACC1',
      market: Market.SH,
      brokerKey: 'b',
      productKey: 'p',
      companyKey: 'c',
      localFilePath: file,
    });
    expect(tx.position.deleteMany).toHaveBeenCalledWith({
      where: { tradeDay: '2026-08-17', fundAccount: 'ACC1', market: Market.SH },
    });
    expect(tx.position.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          ticker: '600000.SH',
          totalQty: 100,
          sellableQty: 80,
          tradeDay: '2026-08-17',
          fundAccount: 'ACC1',
          market: Market.SH,
        }),
      ],
    });
    const created = tx.position.createMany.mock.calls[0][0].data;
    expect(created.map((row: { ticker: string }) => row.ticker)).toEqual([
      '600000.SH',
    ]);
  });

  it('invokes createMany bound to the prisma model', async () => {
    tx.position.createMany.mockImplementation(function (this: unknown) {
      if (this !== tx.position) {
        throw new Error('createMany called unbound');
      }
    });
    const file = writeFixture('position.SH.json', [
      { ticker: '600000.SH', total_qty: 1, sellable_qty: 1 },
    ]);
    const writer = new TradeDataSyncWriter(prisma as any);
    await expect(
      writer.write({
        ...baseInput,
        dataType: TradeDataType.POSITION,
        localFilePath: file,
      })
    ).resolves.toBeUndefined();
  });

  it('empty position file deletes existing rows and inserts none', async () => {
    const file = writeFixture('position.SH.json', []);
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.POSITION,
      localFilePath: file,
    });
    expect(tx.position.deleteMany).toHaveBeenCalledWith({
      where: { tradeDay: '2026-08-17', fundAccount: 'ACC1', market: Market.SH },
    });
    expect(tx.position.createMany).not.toHaveBeenCalled();
  });

  it('rejects FUND write without reason and does not touch innerFundSnapshot', async () => {
    const file = writeFixture('fund.SH.json', {
      balance: 1,
      buying_power: 2,
      frozen: 3,
    });
    const writer = new TradeDataSyncWriter(prisma as any);
    await expect(
      writer.write({
        ...baseInput,
        dataType: TradeDataType.FUND,
        localFilePath: file,
      })
    ).rejects.toThrow(/reason/i);
    expect(tx.innerFundSnapshot.deleteMany).not.toHaveBeenCalled();
    expect(tx.innerFundSnapshot.create).not.toHaveBeenCalled();
  });

  it('replaces fund snapshot for tradeDay+account+market+reason and does not append', async () => {
    const file = writeFixture('fund.SH.json', {
      balance: 1,
      buying_power: 2,
      frozen: 3,
      market: 2,
      xtp_account: {},
      atp_account: {},
    });
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.FUND,
      localFilePath: file,
      reason: InnerFundSnapshotReason.AFTER_TRADING_DAY,
    });
    expect(tx.innerFundSnapshot.deleteMany).toHaveBeenCalledWith({
      where: {
        trade_day: '2026-08-17',
        fund_account: 'ACC1',
        market: Market.SH,
        reason: InnerFundSnapshotReason.AFTER_TRADING_DAY,
      },
    });
    expect(tx.innerFundSnapshot.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        balance: 1,
        buying_power: 2,
        frozen: 3,
        reason: InnerFundSnapshotReason.AFTER_TRADING_DAY,
      }),
    });
    expect(tx.innerFundSnapshot.create).toHaveBeenCalledTimes(1);
    const created = tx.innerFundSnapshot.create.mock.calls[0][0].data;
    expect(created.reason).toBe(InnerFundSnapshotReason.AFTER_TRADING_DAY);
    expect(created.trade_day).toBe('2026-08-17');
  });

  it('chunks createMany at 1000 rows', async () => {
    const rows = Array.from({ length: WRITE_CHUNK_SIZE + 1 }, (_, i) => ({
      ticker: `60${String(i).padStart(4, '0')}.SH`,
      total_qty: i,
      sellable_qty: i,
    }));
    const file = writeFixture('position.SH.json', rows);
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.POSITION,
      localFilePath: file,
    });
    expect(tx.position.createMany).toHaveBeenCalledTimes(2);
    expect(tx.position.createMany.mock.calls[0][0].data).toHaveLength(1000);
    expect(tx.position.createMany.mock.calls[1][0].data).toHaveLength(1);
  });

  it('replaces orders then maps side B/S', async () => {
    const file = writeFixture('order.SH.json', [
      {
        order_api_id: 1,
        order_ref: 10,
        ticker: '600000.SH',
        price: 10.5,
        quantity: 100,
        price_type: 1,
        side: 'B'.charCodeAt(0),
        qty_left: 20,
        insert_time: 1,
        update_time: 2,
        cancel_time: 0,
        status: 0,
      },
      {
        order_api_id: 2,
        order_ref: 11,
        ticker: '600001.SH',
        price: 9,
        quantity: 50,
        price_type: 1,
        side: 'S'.charCodeAt(0),
        qty_left: 50,
        insert_time: 3,
        update_time: 4,
        cancel_time: 5,
        status: 1,
      },
    ]);
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.ORDER,
      localFilePath: file,
    });
    expect(tx.order.deleteMany).toHaveBeenCalledWith({
      where: { tradeDay: '2026-08-17', fundAccount: 'ACC1', market: Market.SH },
    });
    expect(tx.order.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          ticker: '600000.SH',
          side: Side.BUY,
          qtyTraded: 80,
          qtyLeft: 20,
          orderApiId: BigInt(1),
          orderRef: 10,
        }),
        expect.objectContaining({
          ticker: '600001.SH',
          side: Side.SELL,
          qtyTraded: 0,
          qtyLeft: 50,
          orderApiId: BigInt(2),
          orderRef: 11,
        }),
      ],
    });
  });

  it('skips order rows with invalid side', async () => {
    const file = writeFixture('order.SH.json', [
      {
        order_api_id: 1,
        order_ref: 10,
        ticker: '600000.SH',
        price: 10,
        quantity: 100,
        price_type: 1,
        side: 'B'.charCodeAt(0),
        qty_left: 0,
        insert_time: 1,
        update_time: 2,
        cancel_time: 0,
        status: 0,
      },
      {
        order_api_id: 2,
        order_ref: 11,
        ticker: '600001.SH',
        price: 9,
        quantity: 50,
        price_type: 1,
        side: 0,
        qty_left: 0,
        insert_time: 3,
        update_time: 4,
        cancel_time: 0,
        status: 0,
      },
    ]);
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.ORDER,
      localFilePath: file,
    });
    const created = tx.order.createMany.mock.calls[0][0].data;
    expect(created).toHaveLength(1);
    expect(created[0]).toEqual(
      expect.objectContaining({ ticker: '600000.SH', side: Side.BUY })
    );
  });

  it('replaces trades then maps side B/S', async () => {
    const file = writeFixture('trade.SH.json', [
      {
        ticker: '600000.SH',
        order_api_id: 1,
        order_ref: 10,
        trade_id: 'T1',
        trade_price: 10,
        trade_quantity: 100,
        trade_time: 123,
        side: 'B'.charCodeAt(0),
      },
      {
        ticker: '600001.SH',
        order_api_id: 2,
        order_ref: 11,
        trade_id: 'T2',
        trade_price: 8,
        trade_quantity: 50,
        trade_time: 456,
        side: 'S'.charCodeAt(0),
      },
    ]);
    const writer = new TradeDataSyncWriter(prisma as any);
    await writer.write({
      ...baseInput,
      dataType: TradeDataType.TRADE,
      localFilePath: file,
    });
    expect(tx.trade.deleteMany).toHaveBeenCalledWith({
      where: { tradeDay: '2026-08-17', fundAccount: 'ACC1', market: Market.SH },
    });
    expect(tx.trade.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          ticker: '600000.SH',
          tradeId: 'T1',
          side: Side.BUY,
          price: 10,
          quantity: 100,
          tradeAmount: 1000,
          orderApiId: BigInt(1),
        }),
        expect.objectContaining({
          ticker: '600001.SH',
          tradeId: 'T2',
          side: Side.SELL,
          tradeAmount: 400,
        }),
      ],
    });
  });

  it('builds localTradeDataFile with compact tradeDay', () => {
    expect(
      localTradeDataFile({
        tradeDataDir: '/data/trade_data',
        brokerKey: 'ht',
        account: 'ACC1',
        tradeDay: '2026-08-17',
        kind: 'position',
        market: Market.SH,
      })
    ).toBe('/data/trade_data/ht/ACC1/20260817/position.SH.json');
  });

  it('uses distinct local files for before and after fund snapshots', () => {
    const before = localTradeDataFile({
      tradeDataDir: '/data/trade_data',
      brokerKey: 'ht',
      account: 'ACC1',
      tradeDay: '2026-08-17',
      kind: 'fund',
      market: Market.SH,
      taskType: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
    });
    const after = localTradeDataFile({
      tradeDataDir: '/data/trade_data',
      brokerKey: 'ht',
      account: 'ACC1',
      tradeDay: '2026-08-17',
      kind: 'fund',
      market: Market.SH,
      taskType: OpsTaskType.AFTER_SYNC_FUND_ACCOUNT,
    });
    expect(before).toBe(
      '/data/trade_data/ht/ACC1/20260817/fund.BEFORE_SYNC_FUND_ACCOUNT.SH.json'
    );
    expect(after).toBe(
      '/data/trade_data/ht/ACC1/20260817/fund.AFTER_SYNC_FUND_ACCOUNT.SH.json'
    );
    expect(before).not.toBe(after);
  });
});
