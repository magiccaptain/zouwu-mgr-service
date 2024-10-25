import path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { FundAccountType, Market } from '@prisma/client';

import { HostServerService } from 'src/host_server/host_server.service';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FundAccountService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService
  ) {}

  // 从托管服务器上查询股票账户资金信息
  async queryStockAccountFromHostServer(
    account: string,
    market: Market
  ): Promise<any> {
    const fundAccount = await this.prismaService.fundAccount.findFirst({
      where: {
        account: account,
        type: FundAccountType.STOCK,
      },
    });

    if (!fundAccount) {
      throw new NotFoundException('Fund account not found');
    }

    if (!fundAccount.active) {
      throw new NotFoundException('Fund account not active');
    }

    const hostServer = await this.prismaService.hostServer.findFirst({
      where: {
        market: market,
        is_master: true,
        brokerKey: fundAccount.brokerKey,
      },
    });

    if (!hostServer) {
      throw new NotFoundException('Host server not found');
    }

    const zhisui_tool_path = path.join(hostServer.home_dir, 'zhisui_tools');

    const ret = await this.hostServerService.execCommand(
      hostServer,
      `LD_LIBRARY_PATH=. ./trader_tools query_account -a ${account}`,
      {
        cwd: zhisui_tool_path,
      }
    );

    if (ret.code !== 0) {
      console.error(ret.stderr, ret.stdout);

      throw new Error('query fund account failed');
    }

    const data = ret.stdout
      .split('\n')
      .map((l) => tryParseJSON(l))
      .filter(Boolean);

    const marketCode = market === Market.SH ? 2 : 1;

    const found = data.find((d) => d.market === marketCode);

    if (!found) {
      throw new NotFoundException('Fund account not query from host server');
    }

    return found;
  }
}
