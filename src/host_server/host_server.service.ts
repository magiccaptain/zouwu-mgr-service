import path from 'path';

import { Injectable } from '@nestjs/common';
import { HostServer } from '@prisma/client';
import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from 'node-ssh';

import { settings } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HostServerService {
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
}
