import fs from 'fs';
import os from 'os';
import path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { ATPConfig, HostServer, Market, XTPConfig } from '@prisma/client';
import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from 'node-ssh';

import { settings } from 'src/config';
import { MarketCode } from 'src/config/constants';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';

class RemoteCommandException extends Error {
  constructor(data: {
    message: string;
    code: number;
    stdout: string;
    stderr: string;
    cmd: string;
    brokerKey: string;
    ssh_port: number;
  }) {
    super(JSON.stringify(data));
  }
}

@Injectable()
export class HostServerService {
  ssh_cache: { [id: number]: NodeSSH } = {};

  constructor(private readonly prismaService: PrismaService) {}

  async connect(hostServer: HostServer) {
    const { ssh_host, ssh_port, ssh_user } = hostServer;

    const node_ssh = new NodeSSH();
    await node_ssh.connect({
      host: ssh_host,
      port: ssh_port,
      username: ssh_user,
      privateKeyPath: settings.ssh.local_private_key_path,
    });

    console.log('连接成功');

    return node_ssh;
  }

  async getSSH(hostServer: HostServer) {
    if (this.ssh_cache[hostServer.id]) {
      return this.ssh_cache[hostServer.id];
    }

    console.log(`新建ssh连接: ${hostServer.brokerKey} ${hostServer.ssh_port}`);
    const ssh = await this.connect(hostServer);
    this.ssh_cache[hostServer.id] = ssh;

    return ssh;
  }

  async freeSSH(hostServer: HostServer) {
    if (this.ssh_cache[hostServer.id]) {
      console.log(
        `释放ssh连接: ${hostServer.brokerKey} ${hostServer.ssh_port}`
      );
      this.ssh_cache[hostServer.id].dispose();
      delete this.ssh_cache[hostServer.id];
    }
  }

  async execCommand(
    hostServer: HostServer,
    command: string,
    opt?: SSHExecCommandOptions
  ): Promise<SSHExecCommandResponse> {
    const node_ssh = await this.connect(hostServer);
    const ret = await node_ssh.execCommand(command, opt);
    node_ssh.dispose();

    return ret;
  }

  async queryAccountCommand(
    hostServer: HostServer,
    fund_account: string,
    market: Market
  ) {
    const { home_dir, brokerKey, ssh_port } = hostServer;
    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} query_account -a ${fund_account}`;

    console.log(brokerKey, ssh_port, cmd);

    const ssh = await this.getSSH(hostServer);

    await ssh.execCommand(`pkill trader_tools`);

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');
    const ret = await ssh.execCommand(cmd, {
      cwd: zhisui_tool_path,
    });

    if (ret.code !== 0) {
      throw new RemoteCommandException({
        message: 'Query fund account failed',
        code: ret.code,
        stdout: ret.stdout,
        stderr: ret.stderr,
        cmd: cmd,
        brokerKey: brokerKey,
        ssh_port: ssh_port,
      });
    }

    const data = ret.stdout
      .split('\n')
      .map((l) => tryParseJSON(l))
      .filter(Boolean);

    const found = data.find((d) => d.market === MarketCode[market]);

    if (!found) {
      throw new RemoteCommandException({
        message: `Fund account not query from host server`,
        code: ret.code,
        stdout: ret.stdout,
        stderr: ret.stderr,
        cmd: cmd,
        brokerKey: brokerKey,
        ssh_port: ssh_port,
      });
    }
    return found;
  }

  async innerTransferCommand(
    hostServer: HostServer,
    fund_account: string,
    direction: string,
    amount: number
  ) {
    const { home_dir, brokerKey, ssh_port } = hostServer;
    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} inner_transfer -a ${fund_account} -d ${direction.toLowerCase()} -v ${amount}`;

    console.log(brokerKey, ssh_port, cmd);

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    const ssh = await this.getSSH(hostServer);
    await ssh.execCommand(`pkill trader_tools`);

    const ret = await ssh.execCommand(cmd, {
      cwd: zhisui_tool_path,
    });
    if (ret.code !== 0) {
      throw new RemoteCommandException({
        message: 'Inner transfer failed',
        code: ret.code,
        stdout: ret.stdout,
        stderr: ret.stderr,
        cmd: cmd,
        brokerKey: brokerKey,
        ssh_port: ssh_port,
      });
    }
  }

  async externalTransferCommand(
    hostServer: HostServer,
    fund_account: string,
    direction: string,
    amount: number
  ) {
    const { home_dir, brokerKey, ssh_port } = hostServer;
    const cmd = `LD_LIBRARY_PATH=. ./trader_tools --config_dir ${path.join(
      home_dir,
      'td_config'
    )} ext_transfer -a ${fund_account} -d ${direction.toLowerCase()} -v ${amount}`;

    console.log(brokerKey, ssh_port, cmd);

    const zhisui_tool_path = path.join(home_dir, 'zhisui_tools');

    const ssh = await this.getSSH(hostServer);
    await ssh.execCommand(`pkill trader_tools`);

    const ret = await ssh.execCommand(cmd, {
      cwd: zhisui_tool_path,
    });

    if (ret.code !== 0) {
      throw new RemoteCommandException({
        message: 'external transfer failed',
        code: ret.code,
        stdout: ret.stdout,
        stderr: ret.stderr,
        cmd: cmd,
        brokerKey: brokerKey,
        ssh_port: ssh_port,
      });
    }
  }

  /**
   * 测试托管机连接
   * @param hostServer
   */
  async testConnection(hostServer: HostServer): Promise<boolean> {
    try {
      const zhisui_tools_path = path.join(hostServer.home_dir, 'zhisui_tools');

      const ret = await this.execCommand(
        hostServer,
        `./gom ${hostServer.home_dir}`,
        {
          cwd: zhisui_tools_path,
        }
      );

      // 执行失败
      if (ret.code !== 0) {
        console.error(ret.stdout, ret.stderr);
        return false;
      } else {
        console.log(ret.stdout);
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
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
