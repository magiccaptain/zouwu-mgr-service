import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  FundAccountType,
  InnerFundSnapshotReason,
  Market,
  RemoteCommandStatus,
  RemoteCommandType,
  TransferType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { HostServerService } from 'src/host_server/host_server.service';
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

  async innerTransfer_1(fund_account: string, transferDto: TransferDto) {
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

  async innerTransfer(fund_account: string, transferDto: TransferDto) {
    const { market: marketStr, amount, direction } = transferDto;
    const market = marketStr as Market;
    const other_market: Market = market === Market.SH ? Market.SZ : Market.SH;

    const hostServer = await this.findMasterServer(fund_account, market);
    const other_server = await this.findMasterServer(
      fund_account,
      other_market
    );

    try {
      // 转账前查询
      const before = await this.hostServerService.queryAccountCommand(
        hostServer,
        fund_account,
        market
      );
      const before_other = await this.hostServerService.queryAccountCommand(
        other_server,
        fund_account,
        other_market
      );

      // 转账
      await this.hostServerService.innerTransferCommand(
        hostServer,
        fund_account,
        direction,
        amount
      );

      // 转账后查询
      const after = await this.hostServerService.queryAccountCommand(
        hostServer,
        fund_account,
        market
      );
      const after_other = await this.hostServerService.queryAccountCommand(
        other_server,
        fund_account,
        other_market
      );

      const { id: recordId } = await this.prismaService.transferRecord.create({
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
                  balance: before.balance,
                  buying_power: before.buying_power,
                  frozen: before.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: before.xtp_account,
                  atp_account: before.atp_account,
                },
                {
                  market,
                  fund_account,
                  reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                  balance: after.balance,
                  buying_power: after.buying_power,
                  frozen: after.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: after.xtp_account,
                  atp_account: after.atp_account,
                },
                {
                  market: other_market,
                  fund_account,
                  reason: InnerFundSnapshotReason.BEFORE_TRANSFER,
                  balance: before_other.balance,
                  buying_power: before_other.buying_power,
                  frozen: before_other.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: before_other.xtp_account,
                  atp_account: before_other.atp_account,
                },
                {
                  market: other_market,
                  fund_account,
                  reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                  balance: after_other.balance,
                  buying_power: after_other.buying_power,
                  frozen: after_other.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: after_other.xtp_account,
                  atp_account: after_other.atp_account,
                },
              ],
            },
          },
        },
      });

      const record = await this.prismaService.transferRecord.findUnique({
        where: {
          id: recordId,
        },
        include: {
          snapshots: true,
        },
      });

      return record;
    } catch (error) {
      console.log(error);
    } finally {
      await this.hostServerService.freeSSH(other_server);
      await this.hostServerService.freeSSH(hostServer);
    }
  }

  async externalTransfer_1(fund_account: string, transferDto: TransferDto) {
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

  async externalTransfer(fund_account: string, transferDto: TransferDto) {
    const { market: marketStr, amount, direction } = transferDto;
    const market = marketStr as Market;

    const hostServer = await this.findMasterServer(fund_account, market);

    try {
      // 转账前查询
      const before = await this.hostServerService.queryAccountCommand(
        hostServer,
        fund_account,
        market
      );

      // 转账
      await this.hostServerService.externalTransferCommand(
        hostServer,
        fund_account,
        direction,
        amount
      );

      // 转账后查询
      const after = await this.hostServerService.queryAccountCommand(
        hostServer,
        fund_account,
        market
      );

      const { id: recordId } = await this.prismaService.transferRecord.create({
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
                  balance: before.balance,
                  buying_power: before.buying_power,
                  frozen: before.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: before.xtp_account,
                  atp_account: before.atp_account,
                },
                {
                  market,
                  fund_account,
                  reason: InnerFundSnapshotReason.AFTER_TRANSFER,
                  balance: after.balance,
                  buying_power: after.buying_power,
                  frozen: after.frozen,
                  trade_day: dayjs().format('YYYY-MM-DD'),
                  xtp_account: after.xtp_account,
                  atp_account: after.atp_account,
                },
              ],
            },
          },
        },
      });

      const record = await this.prismaService.transferRecord.findUnique({
        where: {
          id: recordId,
        },
        include: {
          snapshots: true,
        },
      });

      console.log(record);

      return record;
    } catch (error) {
      throw error;
    } finally {
      await this.hostServerService.freeSSH(hostServer);
    }
  }
}
