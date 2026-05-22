import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  FundAccount,
  FundAccountType,
  InnerFundSnapshotReason,
  Market,
  OpsTask,
  RemoteCommandStatus,
  Side,
  TransferType,
} from '@prisma/client';
import dayjs from 'dayjs';

import { settings } from 'src/config';
import { HostServerService } from 'src/host_server/host_server.service';
import { tryParseJSON } from 'src/lib/lang/json';
import { GetMarketByTicker } from 'src/lib/stock';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandError, RemoteCommandService } from 'src/remote-command';

import {
  FundAccountEntity,
  FundSnapshotEntity,
  InnerSnapshotFromServer,
  ListFundAccountQueryDto,
  ListFundSnapshotQueryDto,
  TransferDto,
} from './fund_account.dto';

@Injectable()
export class FundAccountService {
  private readonly logger = new Logger(FundAccountService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService,
    private readonly remoteCommandService: RemoteCommandService
  ) {}

  async listFundSnapshot(
    fund_account: string,
    query: ListFundSnapshotQueryDto
  ): Promise<FundSnapshotEntity[]> {
    const { trade_day, market } = query;

    const snapshots = await this.prismaService.innerFundSnapshot.findMany({
      where: {
        fund_account,
        trade_day,
        market: market as Market,
      },
    });

    return snapshots as FundSnapshotEntity[];
  }

  async listStockAccount(
    query: ListFundAccountQueryDto
  ): Promise<FundAccountEntity[]> {
    const trade_day = dayjs().format('YYYY-MM-DD');
    const accounts = await this.prismaService.fundAccount.findMany({
      where: {
        type: FundAccountType.STOCK,
        brokerKey: query.brokerKey,
        companyKey: query.companyKey,
        productKey: query.productKey,
        active: query.active === undefined ? true : query.active,
      },
      include: {
        InnerFundSnapshot: {
          where: {
            trade_day: trade_day,
          },
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          select: {
            market: true,
            trade_day: true,
            reason: true,
            balance: true,
            buying_power: true,
            frozen: true,
            createdAt: true,
            updatedAt: true,
            xtp_account: true,
            atp_account: true,
          },
        },
      },
    });

    return accounts.map((a) => {
      const { InnerFundSnapshot = [], ...rest } = a;

      const sh_snapshot = InnerFundSnapshot.find((s) => s.market === Market.SH);
      const sz_snapshot = InnerFundSnapshot.find((s) => s.market === Market.SZ);

      return {
        ...rest,
        snapshots: [sh_snapshot, sz_snapshot].filter(Boolean),
      };
    });
  }

  async findMasterServer(fund_account: string, market: Market) {
    const fundAccount = await this.prismaService.fundAccount.findFirst({
      where: {
        account: fund_account,
      },
    });

    if (!fundAccount) {
      throw new NotFoundException(`Fund account: ${fund_account} not found`);
    }

    if (!fundAccount.active) {
      throw new NotFoundException(`Fund account: ${fund_account} not active`);
    }

    const hostServer = await this.prismaService.hostServer.findFirst({
      where: {
        market: market,
        is_master: true,
        brokerKey: fundAccount.brokerKey,
        companyKey: fundAccount.companyKey,
      },
    });

    if (!hostServer) {
      throw new NotFoundException(
        `${fundAccount.brokerKey} ${fundAccount.account}:  Host server not found`
      );
    }

    return hostServer;
  }

  async queryFundAccount(
    account: string,
    market: Market
  ): Promise<InnerSnapshotFromServer> {
    const hostServer = await this.findMasterServer(account, market);

    let remoteCommand = await this.remoteCommandService.makeQueryAccount(
      hostServer,
      account
    );

    remoteCommand = await this.hostServerService.execRemoteCommand(
      remoteCommand
    );

    if (
      remoteCommand.code === 0 &&
      remoteCommand.status === RemoteCommandStatus.DONE
    ) {
      return this.remoteCommandService.parseQueryAccountCmd(remoteCommand);
    } else {
      throw new RemoteCommandError(remoteCommand);
    }
  }

  async queryPosition(
    fundAccount: FundAccount,
    market: Market,
    opTask?: OpsTask,
    trade_day: string = dayjs().format('YYYYMMDD'),
    force_pull = false
  ) {
    const hostServer = await this.findMasterServer(fundAccount.account, market);

    const local_path = path.join(
      settings.trade_data_dir,
      hostServer.brokerKey,
      fundAccount.account,
      trade_day
    );
    // local_path 不存在则创建
    await mkdir(local_path, { recursive: true });
    const local_file = path.join(
      local_path,
      `position.${hostServer.market}.json`
    );

    let should_pull = false;
    if (!fs.existsSync(local_file)) {
      should_pull = true;
    } else {
      should_pull = force_pull;
    }

    if (should_pull) {
      let remoteCommand = await this.remoteCommandService.makeQueryPosition(
        hostServer,
        fundAccount.account,
        opTask
      );

      remoteCommand = await this.hostServerService.execRemoteCommand(
        remoteCommand
      );

      if (
        remoteCommand.code === 0 &&
        remoteCommand.status === RemoteCommandStatus.DONE
      ) {
        const data = remoteCommand.stdout
          .split('\n')
          .map((l) => tryParseJSON(l))
          .filter(Boolean);

        const filtered = data.filter((d) => Boolean(d.file_path));

        if (filtered.length > 0) {
          const remote_file = filtered[0].file_path;

          await this.hostServerService.pullRemoteFile(
            hostServer,
            remote_file,
            local_file
          );

          this.logger.log(
            `${fundAccount.account} ${hostServer.ssh_port}: query_position save to file_path: ${local_file}`
          );
        } else {
          this.logger.error(
            `${fundAccount.account} ${hostServer.ssh_port}: no file_path found in query_position output`
          );
          return;
        }
      } else {
        throw new RemoteCommandError(remoteCommand);
      }
    }

    // save to database
    type RawPosition = {
      ticker: string;
      total_qty: number;
      sellable_qty: number;
    };

    // read local_file
    const raw_positions = fs.readFileSync(local_file, 'utf-8');
    const positions = JSON.parse(raw_positions) as RawPosition[];

    // 写入到数据库
    // 以 tradeDay, fundAccount, market, ticker 为唯一键，改为 upsert
    for (const p of positions) {
      // 只保存同市场
      const ticker_market = GetMarketByTicker(p.ticker);
      if (ticker_market !== hostServer.market) {
        continue;
      }

      await this.prismaService.position.upsert({
        where: {
          tradeDay_fundAccount_market_ticker: {
            tradeDay: dayjs().format('YYYY-MM-DD'),
            fundAccount: fundAccount.account,
            market: hostServer.market,
            ticker: p.ticker,
          },
        },
        update: {
          totalQty: p.total_qty,
          sellableQty: p.sellable_qty,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
        },
        create: {
          tradeDay: dayjs().format('YYYY-MM-DD'),
          fundAccount: fundAccount.account,
          market: hostServer.market,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
          ticker: p.ticker,
          totalQty: p.total_qty,
          sellableQty: p.sellable_qty,
        },
      });
    }

    this.logger.log(
      `${fundAccount.account} ${hostServer.ssh_port}: sync position to database`
    );
  }

  async queryOrder(
    fundAccount: FundAccount,
    market: Market,
    opTask?: OpsTask,
    trade_day: string = dayjs().format('YYYYMMDD'),
    force_pull = false
  ) {
    const hostServer = await this.findMasterServer(fundAccount.account, market);

    const local_path = path.join(
      settings.trade_data_dir,
      hostServer.brokerKey,
      fundAccount.account,
      trade_day
    );

    await mkdir(local_path, { recursive: true });
    const local_file = path.join(local_path, `order.${hostServer.market}.json`);

    let should_pull = false;
    if (!fs.existsSync(local_file)) {
      should_pull = true;
    } else {
      should_pull = force_pull;
    }

    if (should_pull) {
      let remoteCommand = await this.remoteCommandService.makeQueryOrder(
        hostServer,
        fundAccount.account,
        opTask
      );

      remoteCommand = await this.hostServerService.execRemoteCommand(
        remoteCommand
      );

      if (
        remoteCommand.code === 0 &&
        remoteCommand.status === RemoteCommandStatus.DONE
      ) {
        const data = remoteCommand.stdout
          .split('\n')
          .map((l) => tryParseJSON(l))
          .filter(Boolean);

        const filtered = data.filter((d) => Boolean(d.file_path));

        if (filtered.length > 0) {
          const remote_file = filtered[0].file_path;

          await this.hostServerService.pullRemoteFile(
            hostServer,
            remote_file,
            local_file
          );

          this.logger.log(
            `${fundAccount.account} ${hostServer.ssh_port}: query_order save to file_path: ${local_file}`
          );
        } else {
          this.logger.error(
            `${fundAccount.account} ${hostServer.ssh_port}: no file_path found in query_order output`
          );
          return;
        }
      } else {
        throw new RemoteCommandError(remoteCommand);
      }
    }

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

    // read local_file
    const raw_orders = fs.readFileSync(local_file, 'utf-8');
    const orders = JSON.parse(raw_orders) as RawOrder[];

    for (const o of orders) {
      const sideChar = String.fromCharCode(o.side);

      if (sideChar !== 'B' && sideChar !== 'S') {
        this.logger.error(
          `${fundAccount.account} order ${o.order_ref}: invalid side: ${o.side}`
        );
        continue;
      }

      const side = sideChar === 'B' ? Side.BUY : Side.SELL;

      await this.prismaService.order.upsert({
        where: {
          tradeDay_fundAccount_market_ticker_orderRef: {
            tradeDay: dayjs().format('YYYY-MM-DD'),
            fundAccount: fundAccount.account,
            market: hostServer.market,
            ticker: o.ticker,
            orderRef: o.order_ref,
          },
        },
        update: {
          tradeDay: dayjs().format('YYYY-MM-DD'),
          fundAccount: fundAccount.account,
          market: hostServer.market,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
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
        },
        create: {
          tradeDay: dayjs().format('YYYY-MM-DD'),
          fundAccount: fundAccount.account,
          market: hostServer.market,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
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
        },
      });
    }
    this.logger.log(
      `${fundAccount.account} ${hostServer.ssh_port}: sync order to database`
    );
  }

  async queryTrade(
    fundAccount: FundAccount,
    market: Market,
    opTask?: OpsTask,
    trade_day: string = dayjs().format('YYYYMMDD'),
    force_pull = false
  ) {
    const hostServer = await this.findMasterServer(fundAccount.account, market);
    const local_path = path.join(
      settings.trade_data_dir,
      hostServer.brokerKey,
      fundAccount.account,
      trade_day
    );

    await mkdir(local_path, { recursive: true });
    const local_file = path.join(local_path, `trade.${hostServer.market}.json`);

    let should_pull = false;
    if (!fs.existsSync(local_file)) {
      should_pull = true;
    } else {
      should_pull = force_pull;
    }

    if (should_pull) {
      let remoteCommand = await this.remoteCommandService.makeQueryTrade(
        hostServer,
        fundAccount.account,
        opTask
      );

      remoteCommand = await this.hostServerService.execRemoteCommand(
        remoteCommand
      );

      if (
        remoteCommand.code === 0 &&
        remoteCommand.status === RemoteCommandStatus.DONE
      ) {
        const data = remoteCommand.stdout
          .split('\n')
          .map((l) => tryParseJSON(l))
          .filter(Boolean);

        const filtered = data.filter((d) => Boolean(d.file_path));

        if (filtered.length > 0) {
          const remote_file = filtered[0].file_path;

          await this.hostServerService.pullRemoteFile(
            hostServer,
            remote_file,
            local_file
          );

          this.logger.log(
            `${fundAccount.account} ${hostServer.ssh_port}: query_trade save to file_path: ${local_file}`
          );
        } else {
          this.logger.error(
            `${fundAccount.account} ${hostServer.ssh_port}: no file_path found in query_trade output`
          );
          return;
        }
      } else {
        throw new RemoteCommandError(remoteCommand);
      }

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

      const raw_trades = fs.readFileSync(local_file, 'utf-8');
      const trades = JSON.parse(raw_trades) as RawTrade[];

      for (const t of trades) {
        const sideChar = String.fromCharCode(t.side);

        if (sideChar !== 'B' && sideChar !== 'S') {
          this.logger.error(
            `${fundAccount.account} trade ${t.trade_id}: invalid side: ${t.side}`
          );
          continue;
        }

        const side = sideChar === 'B' ? Side.BUY : Side.SELL;

        try {
          await this.prismaService.trade.upsert({
            where: {
              tradeDay_fundAccount_market_ticker_tradeId: {
                tradeDay: dayjs().format('YYYY-MM-DD'),
                fundAccount: fundAccount.account,
                market: hostServer.market,
                ticker: t.ticker,
                tradeId: t.trade_id,
              },
            },
            update: {
              tradeDay: dayjs().format('YYYY-MM-DD'),
              fundAccount: fundAccount.account,
              market: hostServer.market,
              brokerKey: fundAccount.brokerKey,
              productKey: fundAccount.productKey,
              companyKey: fundAccount.companyKey,
              ticker: t.ticker,
              tradeId: t.trade_id,
              orderApiId: BigInt(t.order_api_id),
              orderRef: t.order_ref,
              price: t.trade_price,
              quantity: t.trade_quantity,
              tradeTime: BigInt(t.trade_time),
              tradeAmount: t.trade_price * t.trade_quantity,
              side,
            },
            create: {
              tradeDay: dayjs().format('YYYY-MM-DD'),
              fundAccount: fundAccount.account,
              market: hostServer.market,
              brokerKey: fundAccount.brokerKey,
              productKey: fundAccount.productKey,
              companyKey: fundAccount.companyKey,
              ticker: t.ticker,
              tradeId: t.trade_id,
              orderApiId: BigInt(t.order_api_id),
              orderRef: t.order_ref,
              price: t.trade_price,
              quantity: t.trade_quantity,
              tradeTime: BigInt(t.trade_time),
              tradeAmount: t.trade_price * t.trade_quantity,
              side,
            },
          });
        } catch (error) {
          console.error(error);
          console.log({
            ...t,
            fundAccount: fundAccount.account,
            brokerKey: fundAccount.brokerKey,
          });
          continue;
        }
      }

      this.logger.log(
        `${fundAccount.account} ${hostServer.ssh_port}: sync trade to database`
      );
    }
  }

  async saveFundAccountSnapshot(
    market: Market,
    fund_account: string,
    reason: InnerFundSnapshotReason,
    snapshot: InnerSnapshotFromServer
  ) {
    return await this.prismaService.innerFundSnapshot.create({
      data: {
        market,
        fund_account,
        reason,
        balance: snapshot.balance,
        buying_power: snapshot.buying_power,
        frozen: snapshot.frozen,
        trade_day: dayjs().format('YYYY-MM-DD'),
        xtp_account: snapshot.xtp_account,
        atp_account: snapshot.atp_account,
      },
    });
  }

  async syncFundAccount(
    fund_account: string,
    market: Market,
    reason: InnerFundSnapshotReason
  ) {
    const snapshot = await this.queryFundAccount(fund_account, market);
    await this.saveFundAccountSnapshot(market, fund_account, reason, snapshot);
  }

  async innerTransfer(fund_account: string, transferDto: TransferDto) {
    const { market: marketStr, amount, direction } = transferDto;
    const market = marketStr as Market;
    const other_market: Market = market === Market.SH ? Market.SZ : Market.SH;

    const hostServer = await this.findMasterServer(fund_account, market);
    const otherHostServer = await this.findMasterServer(
      fund_account,
      other_market
    );

    const beforeQueryCmd = await this.remoteCommandService.makeQueryAccount(
      hostServer,
      fund_account
    );

    const otherBeforeQueryCmd =
      await this.remoteCommandService.makeQueryAccount(
        otherHostServer,
        fund_account
      );

    const transferCmd = await this.remoteCommandService.makeInnerTrasfer(
      hostServer,
      fund_account,
      direction,
      amount
    );

    const afterQueryCmd = await this.remoteCommandService.makeQueryAccount(
      hostServer,
      fund_account
    );

    const otherAfterQueryCmd = await this.remoteCommandService.makeQueryAccount(
      otherHostServer,
      fund_account
    );

    let cmds = [
      beforeQueryCmd,
      otherBeforeQueryCmd,
      transferCmd,
      afterQueryCmd,
      otherAfterQueryCmd,
    ];

    cmds = await this.hostServerService.batchExecRemoteCommand(cmds);

    for (const cmd of cmds) {
      if (cmd.code !== 0) {
        throw new RemoteCommandError(cmd);
      }
    }

    const beforeSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[0]
    );
    const otherBeforeSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[1]
    );

    const afterSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[3]
    );

    const otherAfterSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[4]
    );

    const today = dayjs().format('YYYY-MM-DD');

    const record = await this.prismaService.transferRecord.create({
      data: {
        market,
        fund_account,
        trade_day: dayjs().format('YYYY-MM-DD'),
        direction,
        amount,
        type: TransferType.INNER,
        snapshots: {
          createMany: {
            data: [
              {
                market,
                fund_account,
                reason: InnerFundSnapshotReason.BEFORE_TRANSFER,
                balance: beforeSnapshot.balance,
                buying_power: beforeSnapshot.buying_power,
                frozen: beforeSnapshot.frozen,
                trade_day: today,
                xtp_account: beforeSnapshot.xtp_account,
                atp_account: beforeSnapshot.atp_account,
              },
              {
                market,
                fund_account,
                reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                balance: afterSnapshot.balance,
                buying_power: afterSnapshot.buying_power,
                frozen: afterSnapshot.frozen,
                trade_day: today,
                xtp_account: afterSnapshot.xtp_account,
                atp_account: afterSnapshot.atp_account,
              },
              {
                market: other_market,
                fund_account,
                reason: InnerFundSnapshotReason.BEFORE_TRANSFER,
                balance: otherBeforeSnapshot.balance,
                buying_power: otherBeforeSnapshot.buying_power,
                frozen: otherBeforeSnapshot.frozen,
                trade_day: today,
                xtp_account: otherBeforeSnapshot.xtp_account,
                atp_account: otherBeforeSnapshot.atp_account,
              },
              {
                market: other_market,
                fund_account,
                reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                balance: otherAfterSnapshot.balance,
                buying_power: otherAfterSnapshot.buying_power,
                frozen: otherAfterSnapshot.frozen,
                trade_day: dayjs().format('YYYY-MM-DD'),
                xtp_account: otherAfterSnapshot.xtp_account,
                atp_account: otherAfterSnapshot.atp_account,
              },
            ],
          },
        },
      },
      include: {
        snapshots: true,
      },
    });

    return record;
  }

  async externalTransfer(fund_account: string, transferDto: TransferDto) {
    const { market: marketStr, amount, direction } = transferDto;
    const market = marketStr as Market;

    const hostServer = await this.findMasterServer(fund_account, market);

    const beforeQueryCmd = await this.remoteCommandService.makeQueryAccount(
      hostServer,
      fund_account
    );

    const transferCmd = await this.remoteCommandService.makeExternalTrasfer(
      hostServer,
      fund_account,
      direction,
      amount
    );

    const afterQueryCmd = await this.remoteCommandService.makeQueryAccount(
      hostServer,
      fund_account
    );

    let cmds = [beforeQueryCmd, transferCmd, afterQueryCmd];

    cmds = await this.hostServerService.batchExecRemoteCommand(cmds);

    for (const cmd of cmds) {
      if (cmd.code !== 0) {
        throw new RemoteCommandError(cmd);
      }
    }

    const beforeSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[0]
    );

    const afterSnapshot = this.remoteCommandService.parseQueryAccountCmd(
      cmds[2]
    );

    const today = dayjs().format('YYYY-MM-DD');

    const record = await this.prismaService.transferRecord.create({
      data: {
        market,
        fund_account,
        trade_day: dayjs().format('YYYY-MM-DD'),
        direction,
        amount,
        type: TransferType.EXTERNAL,
        snapshots: {
          createMany: {
            data: [
              {
                market,
                fund_account,
                reason: InnerFundSnapshotReason.BEFORE_TRANSFER,
                balance: beforeSnapshot.balance,
                buying_power: beforeSnapshot.buying_power,
                frozen: beforeSnapshot.frozen,
                trade_day: today,
                xtp_account: beforeSnapshot.xtp_account,
                atp_account: beforeSnapshot.atp_account,
              },
              {
                market,
                fund_account,
                reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                balance: afterSnapshot.balance,
                buying_power: afterSnapshot.buying_power,
                frozen: afterSnapshot.frozen,
                trade_day: today,
                xtp_account: afterSnapshot.xtp_account,
                atp_account: afterSnapshot.atp_account,
              },
            ],
          },
        },
      },
      include: {
        snapshots: true,
      },
    });

    return record;
  }
}
