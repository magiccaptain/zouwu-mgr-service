import path from 'path';

import { Injectable } from '@nestjs/common';
import {
  HostServer,
  OpsTask,
  RemoteCommandType,
  type Prisma,
} from '@prisma/client';
import dayjs from 'dayjs';

import { MarketCode } from 'src/config/constants';
import { InnerSnapshotFromServer } from 'src/fund_account';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';

import { RemoteCommandError, type RemoteCommand } from './types';

@Injectable()
export class RemoteCommandService {
  constructor(private readonly prismaService: PrismaService) {}

  async makeCheckDisk(hostServer: HostServer, opTask?: OpsTask) {
    const { home_dir } = hostServer;
    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    const cmd = `./gom ${home_dir}`;

    const trade_day = opTask?.trade_day || dayjs().format('YYYY-MM-DD');

    const createInput: Prisma.RemoteCommandCreateInput = {
      type: RemoteCommandType.DISK_CHECK,
      trade_day,
      cmd: cmd,
      cwd: zhisui_tool_path,
      hostServer: {
        connect: { id: hostServer.id },
      },
    };

    if (opTask) {
      createInput.opsTask = {
        connect: { id: opTask.id },
      };
    }

    return await this.prismaService.remoteCommand.create({
      data: createInput,
      include: { hostServer: true, opsTask: true, fundAccount: true },
    });
  }

  async makeCheckTime(hostServer: HostServer, opTask?: OpsTask) {
    const trade_day = opTask?.trade_day || dayjs().format('YYYY-MM-DD');

    const data: Prisma.RemoteCommandCreateInput = {
      trade_day,
      type: RemoteCommandType.TIME_CHECK,
      cmd: "date '+%Y-%m-%d %H:%M:%S'",
      hostServer: {
        connect: { id: hostServer.id },
      },
    };

    if (opTask) {
      data.opsTask = {
        connect: { id: opTask.id },
      };
    }

    return await this.prismaService.remoteCommand.create({
      data,
      include: { hostServer: true, opsTask: true, fundAccount: true },
    });
  }

  /**
   * 查询资金账户命令
   * @param hostServer
   * @param account
   * @returns
   */
  async makeQueryAccount(
    hostServer: HostServer,
    account: string,
    opTask?: OpsTask
  ): Promise<RemoteCommand> {
    const { home_dir } = hostServer;

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} query_account -a ${account}`;

    const data: Prisma.RemoteCommandCreateInput = {
      type: RemoteCommandType.QUERY_ACCOUNT,
      trade_day: dayjs().format('YYYY-MM-DD'),
      cmd: cmd,
      cwd: zhisui_tool_path,
      fundAccount: {
        connect: { account },
      },
      hostServer: {
        connect: { id: hostServer.id },
      },
    };

    if (opTask) {
      data.opsTask = {
        connect: { id: opTask.id },
      };
    }

    return this.prismaService.remoteCommand.create({
      data,
      include: { hostServer: true, opsTask: true, fundAccount: true },
    });
  }

  parseQueryAccountCmd(remoteCommand: RemoteCommand): InnerSnapshotFromServer {
    const { stdout, hostServer } = remoteCommand;
    const { market } = hostServer;

    const data = stdout
      .split('\n')
      .map((l) => tryParseJSON(l))
      .filter(Boolean);

    const found = data.find((d) => d.market === MarketCode[market]);

    if (!found) {
      throw new RemoteCommandError(
        remoteCommand,
        '未找到对应的市场信息 market: ' + market
      );
    }

    return found;
  }

  /**
   * 内部转账命令
   * @param hostServer
   * @param fund_account
   * @param direction
   * @param amount
   * @returns
   */
  async makeInnerTrasfer(
    hostServer: HostServer,
    fund_account: string,
    direction: string,
    amount: number
  ) {
    const { home_dir } = hostServer;
    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} inner_transfer -a ${fund_account} -d ${direction.toLowerCase()} -v ${amount}`;

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    return this.prismaService.remoteCommand.create({
      data: {
        type: RemoteCommandType.INNER_TRANSFER,
        trade_day: dayjs().format('YYYY-MM-DD'),
        cmd: cmd,
        cwd: zhisui_tool_path,
        hostServer: {
          connect: { id: hostServer.id },
        },
        fundAccount: {
          connect: { account: fund_account },
        },
      },
      include: { hostServer: true, opsTask: true, fundAccount: true },
    });
  }

  /**
   * 外部转账命令
   * @param hostServer
   * @param fund_account
   * @param direction
   * @param amount
   * @returns
   */
  async makeExternalTrasfer(
    hostServer: HostServer,
    fund_account: string,
    direction: string,
    amount: number
  ) {
    const { home_dir } = hostServer;

    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} ext_transfer -a ${fund_account} -d ${direction.toLowerCase()} -v ${amount}`;

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    return this.prismaService.remoteCommand.create({
      data: {
        type: RemoteCommandType.EXTERNAL_TRANSFER,
        trade_day: dayjs().format('YYYY-MM-DD'),
        cmd: cmd,
        cwd: zhisui_tool_path,
        hostServer: {
          connect: { id: hostServer.id },
        },
        fundAccount: {
          connect: { account: fund_account },
        },
      },
      include: { hostServer: true, opsTask: true, fundAccount: true },
    });
  }
}
