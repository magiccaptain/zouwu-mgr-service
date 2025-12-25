import path from 'path';

import { Injectable } from '@nestjs/common';
import {
  HostServer,
  OpsWarningStatus,
  RemoteCommandType,
} from '@prisma/client';
import dayjs from 'dayjs';

import { HostServerService } from 'src/host_server/host_server.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { OpsWarning } from './types';

type ClearDiskRule = {
  cwd: string;
  cmd: string;
  args?: Record<string, string>;
  // 如果设置了，只处理这个port下的服务器
  ssh_port?: number[];
};

@Injectable()
export class WarningService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService
  ) {}

  async clearDisk(hostServer: HostServer): Promise<HostServer> {
    const clearDiskRules: ClearDiskRule[] = [
      {
        cwd: 'common_v6',
        cmd: 'rm -rf core.*',
      },
      {
        cwd: 'common_v6/modeldir/20240701',
        // 删除除本月外其余所有日志文件
        cmd: 'find -name "*.txt" ! -name "*{current_month}*.txt" -exec rm -rf {} +',
        args: {
          current_month: dayjs().format('YYYYMM'),
        },
      },
      {
        cwd: 'quote_data',
        cmd: 'find -name "*.tar.gz" ! -name "*{current_month}*.tar.gz" -exec rm -rf {} +',
        args: {
          current_month: dayjs().format('YYYYMM'),
        },
        ssh_port: [12710],
      },
      {
        cwd: 'share_op/data',
        cmd: 'find -maxdepth 1 -name "*2*" ! -name "*{current_month}*" -exec rm -rf {} +',
        args: {
          current_month: dayjs().format('YYYYMM'),
        },
      },
      {
        cwd: 'share_op/log',
        cmd: 'find -name "*.2*" ! -name "*{current_month}*.*" -exec rm -rf {} +',
        args: {
          current_month: dayjs().format('YYYYMM'),
        },
      },
    ];

    const { ssh_port, home_dir } = hostServer;

    const execRules = clearDiskRules.filter((rule) => {
      if (rule.ssh_port && !rule.ssh_port.includes(ssh_port)) {
        return false;
      }
      return true;
    });

    const trade_day = dayjs().format('YYYY-MM-DD');

    const remoteCommands = await Promise.all(
      execRules.map((rule) => {
        const { cwd, cmd, args } = rule;
        const execCmd = args
          ? cmd.replace(/\{(\w+)\}/g, (_, key) => args[key])
          : cmd;

        return this.prismaService.remoteCommand.create({
          data: {
            type: RemoteCommandType.FREE_DISK,
            cwd: path.join(home_dir, cwd),
            cmd: execCmd,
            hostServer: {
              connect: { id: hostServer.id },
            },
            trade_day,
          },
          include: { hostServer: true, fundAccount: true, opsTask: true },
        });
      })
    );

    await this.hostServerService.batchExecRemoteCommand(remoteCommands);

    // 更新host server数据
    return await this.hostServerService.checkDisk(hostServer);
  }

  async handleDiskFullWarning(warning: OpsWarning): Promise<OpsWarning> {
    const { hostServer } = warning;

    let status: OpsWarningStatus = OpsWarningStatus.AUTO_DONE;

    try {
      await this.clearDisk(hostServer);
    } catch (error) {
      status = OpsWarningStatus.AUTO_ERROR;
    }

    return await this.prismaService.opsWarning.update({
      where: { id: warning.id },
      data: {
        status,
      },
      include: { hostServer: true, fundAccount: true, opsTask: true },
    });
  }
}
