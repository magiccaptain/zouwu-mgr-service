import fs from 'fs';
import os from 'os';
import path from 'path';

import { Injectable } from '@nestjs/common';
import {
  ATPConfig,
  HostServer,
  Market,
  OpsTask,
  OpsWarningType,
  RemoteCommandStatus,
  XTPConfig,
} from '@prisma/client';
import dayjs from 'dayjs';
import { round } from 'lodash';
import { NodeSSH } from 'node-ssh';

import { settings } from 'src/config';
import { MarketCode } from 'src/config/constants';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandService, type RemoteCommand } from 'src/remote-command';

@Injectable()
export class HostServerService {
  ssh_cache: { [id: number]: NodeSSH } = {};

  constructor(
    private readonly prismaService: PrismaService,
    private readonly remoteCommandService: RemoteCommandService
  ) {}

  async getMasterServer(brokerKey: string, market: Market, companyKey: string) {
    return await this.prismaService.hostServer.findFirst({
      where: {
        brokerKey,
        market,
        companyKey,
        is_master: true,
      },
    });
  }

  async connect(hostServer: HostServer) {
    const { ssh_host, ssh_port, ssh_user } = hostServer;

    const node_ssh = new NodeSSH();
    await node_ssh.connect({
      host: ssh_host,
      port: ssh_port,
      username: ssh_user,
      privateKeyPath: settings.ssh.local_private_key_path,
    });

    return node_ssh;
  }

  async runRemoteCommand(
    remoteCommand: RemoteCommand,
    node_ssh: NodeSSH
  ): Promise<RemoteCommand> {
    const { cmd, cwd, id } = remoteCommand;

    try {
      const { code, stdout, stderr } = await node_ssh.execCommand(cmd, {
        cwd,
      });
      return await this.prismaService.remoteCommand.update({
        where: { id },
        data: {
          code,
          stdout,
          stderr,
          status: RemoteCommandStatus.DONE,
        },
        include: {
          hostServer: true,
          opsTask: true,
          fundAccount: true,
        },
      });
    } catch (error) {
      return await this.prismaService.remoteCommand.update({
        where: { id },
        data: {
          code: 999,
          stdout: '',
          stderr: error.message,
          status: RemoteCommandStatus.ERROR,
        },
        include: {
          hostServer: true,
          opsTask: true,
          fundAccount: true,
        },
      });
    }
  }

  async connectWithRemoteCommand(remoteCommand: RemoteCommand) {
    const { hostServer, id } = remoteCommand;
    try {
      const node_ssh = await this.connect(hostServer);
      return node_ssh;
    } catch (error) {
      await this.prismaService.remoteCommand.update({
        where: { id },
        data: {
          code: 999,
          stdout: '',
          stderr: error.message,
          status: RemoteCommandStatus.ERROR,
        },
        include: {
          hostServer: true,
          opsTask: true,
          fundAccount: true,
        },
      });
    }
  }

  /**
   * 执行远程命令
   * @param remoteCommand
   */
  async execRemoteCommand(
    remoteCommand: RemoteCommand
  ): Promise<RemoteCommand> {
    const node_ssh = await this.connectWithRemoteCommand(remoteCommand);

    const remoteCommandUpdated = await this.runRemoteCommand(
      remoteCommand,
      node_ssh
    );
    // 断开 ssh 连接
    node_ssh?.dispose();

    return remoteCommandUpdated;
  }

  /**
   * 批量执行远程命令
   * @param remoteCommands
   */
  async batchExecRemoteCommand(
    remoteCommands: RemoteCommand[],
    parallel = false
  ): Promise<RemoteCommand[]> {
    const ssh_pool: { [id: number]: NodeSSH } = {};

    let result: RemoteCommand[] = [];

    if (!parallel) {
      for (const remoteCommand of remoteCommands) {
        const { hostServer } = remoteCommand;

        if (!ssh_pool[hostServer.id]) {
          ssh_pool[hostServer.id] = await this.connectWithRemoteCommand(
            remoteCommand
          );
        }

        const ret_cmd = await this.runRemoteCommand(
          remoteCommand,
          ssh_pool[hostServer.id]
        );
        result.push(ret_cmd);
      }
    } else {
      result = await Promise.all(
        remoteCommands.map(async (cmd) => {
          const { hostServer } = cmd;

          if (!ssh_pool[hostServer.id]) {
            ssh_pool[hostServer.id] = await this.connectWithRemoteCommand(cmd);
          }

          return this.runRemoteCommand(cmd, ssh_pool[hostServer.id]);
        })
      );
    }

    // 断开 ssh 连接
    for (const ssh of Object.values(ssh_pool)) {
      ssh.dispose();
    }

    return result;
  }

  async checkDisk(hostServer: HostServer, task?: OpsTask): Promise<HostServer> {
    let command = await this.remoteCommandService.makeCheckDisk(
      hostServer,
      task
    );

    command = await this.execRemoteCommand(command);
    const { code, stdout, trade_day, opsTaskId, id } = command;
    const info = tryParseJSON(stdout);

    if (code !== 0 || (code === 0 && !info)) {
      await this.prismaService.opsWarning.create({
        data: {
          type: OpsWarningType.DISK_CHECK_FAILED,
          trade_day,
          opsTask: {
            connect: {
              id: opsTaskId,
            },
          },
          hostServer: {
            connect: {
              id: hostServer.id,
            },
          },
          remoteCommand: {
            connect: {
              id: id,
            },
          },
          text: `磁盘检查失败`,
        },
      });

      return hostServer;
    }

    const {
      disk_total,
      disk_free,
      os,
      os_version,
      cpu_model,
      cpu_cores,
      mem_total,
    } = info;
    const disk_percent = (disk_total - disk_free) / disk_total;

    if (disk_percent > settings.warning.disk_usage) {
      await this.prismaService.opsWarning.create({
        data: {
          type: OpsWarningType.DISK_FULL,
          trade_day,
          opsTask: {
            connect: {
              id: opsTaskId,
            },
          },
          hostServer: {
            connect: {
              id: hostServer.id,
            },
          },
          remoteCommand: {
            connect: {
              id: id,
            },
          },
          text: `磁盘使用率 ${round(disk_percent * 100)}%`,
        },
      });
    }

    return await this.prismaService.hostServer.update({
      where: {
        id: hostServer.id,
      },
      data: {
        last_check_at: dayjs().toDate(),
        disk_total,
        disk_used: disk_total - disk_free,
        os,
        os_version,
        cpu_model,
        cpu_cores,
        memory_size: mem_total,
      },
    });
  }

  async syncTDConfig(hostServer: HostServer, tdConfig: XTPConfig | ATPConfig) {
    let section_key;
    const trader = {
      log_level: 'debug',
      log_name: 'Trader',
      log_path: './log',
      data_path: path.join(
        hostServer.home_dir,
        'trade_data',
        tdConfig.fund_account
      ),
      market: MarketCode[tdConfig.market],
    };
    const other_config = {};
    switch (hostServer.brokerKey) {
      case 'xtp':
        section_key = 'xtp_td';
        other_config['client_id'] = 20;
        break;
      case 'guojun':
        section_key = 'atp_guojun_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'guoxin':
        section_key = 'atp_guoxin_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'zhongjin':
        section_key = 'atp_zhongjin_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'zhongxin':
        section_key = 'atp_zhongxin_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'zhongjin_eq':
        section_key = 'atp_zhongjin_eq_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'fangzheng':
        section_key = 'atp_fangzheng_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'zhaoshang_dma':
        section_key = 'atp_zhaoshang_dma_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      case 'anxin':
        section_key = 'atp_anxin_td';
        other_config['fund_account_id'] = tdConfig.fund_account;
        break;
      default:
        return;
    }

    // tdConfig 中去掉 为 None 的字段
    for (const key in tdConfig) {
      if (tdConfig[key] === null || tdConfig[key] === undefined) {
        delete tdConfig[key];
      }
    }

    const data = {
      trader,
      [section_key]: {
        ...tdConfig,
        ...other_config,
      },
    };

    const objectToIni = (object: object): string => {
      let ini = '';
      for (const key in object) {
        if (typeof object[key] === 'object') {
          ini += `[${key}]\n${objectToIni(object[key])}\n`;
        } else {
          ini += `${key}=${object[key]}\n`;
        }
      }
      return ini;
    };

    const text = objectToIni(data);

    // 写入到临时文件
    const temp_file_path = path.join(
      os.tmpdir(),
      `td_config_${tdConfig.fund_account}_${hostServer.brokerKey}.ini`
    );
    fs.writeFileSync(temp_file_path, text);

    // 上传到托管机
    const zhisui_tools_path = path.join(hostServer.home_dir, 'td_config');
    const ssh = await this.connect(hostServer);
    ssh.execCommand(`mkdir -p ${zhisui_tools_path}`);

    await ssh.putFile(
      temp_file_path,
      path.join(zhisui_tools_path, `${tdConfig.fund_account}.config.ini`)
    );

    // 删除临时文件
    fs.unlinkSync(temp_file_path);
    ssh.dispose();

    console.log(
      `${hostServer.brokerKey} ${hostServer.ssh_port}: ${tdConfig.fund_account} 配置上传成功`
    );
  }
}
