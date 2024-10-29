import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FundAccountType,
  InnerFundSnapshotReason,
  Market,
  TransferType,
} from '@prisma/client';
import dayjs from 'dayjs';

import { HostServerService } from 'src/host_server/host_server.service';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  FundAccountEntity,
  InnerSnapshotFromServer,
  ListFundAccountQueryDto,
  TransferDto,
} from './fund_account.dto';

@Injectable()
export class FundAccountService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService
  ) {}

  async listStockAccount(
    query: ListFundAccountQueryDto
  ): Promise<FundAccountEntity[]> {
    const accounts = await this.prismaService.fundAccount.findMany({
      where: {
        type: FundAccountType.STOCK,
        brokerKey: query.brokerKey,
        companyKey: query.companyKey,
        productKey: query.productKey,
        active: query.active === undefined ? true : query.active,
      },
    });

    return accounts;
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

  // 从托管服务器上查询股票账户资金信息
  async queryStockAccountFromHostServer(
    account: string,
    market: Market
  ): Promise<InnerSnapshotFromServer> {
    const hostServer = await this.findMasterServer(account, market);
    const accountInfo = await this.hostServerService.queryAccountCommand(
      hostServer,
      account,
      market
    );

    await this.hostServerService.freeSSH(hostServer);

    return accountInfo;
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
    const hostServer = await this.findMasterServer(fund_account, market);
    const snapshot = await this.hostServerService.queryAccountCommand(
      hostServer,
      fund_account,
      market
    );
    await this.hostServerService.freeSSH(hostServer);
    return await this.saveFundAccountSnapshot(
      market,
      fund_account,
      reason,
      snapshot
    );
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

    await this.hostServerService.freeSSH(other_server);
    await this.hostServerService.freeSSH(hostServer);

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
  }

  async externalTransfer(fund_account: string, transferDto: TransferDto) {
    const { market: marketStr, amount, direction } = transferDto;
    const market = marketStr as Market;

    const hostServer = await this.findMasterServer(fund_account, market);

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

    await this.hostServerService.freeSSH(hostServer);

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

    return record;
  }
}
