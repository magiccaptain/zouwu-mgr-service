// 同步 ProcessMonitor 配置文件内容

import { NestFactory } from '@nestjs/core';
import { ProcessType } from '@prisma/client';
import { NodeSSH } from 'node-ssh';

import { AppModule } from '../dist/app.module';
import { settings } from '../dist/config';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prismaService = app.get(PrismaService);

  // 查询所有类型为 TRADER 的 ProcessMonitor
  const processMonitors = await prismaService.processMonitor.findMany({
    where: {
      // process_type: ProcessType.TRADER,
      active: true,
    },
    include: {
      hostServer: true,
    },
  });

  console.log(`找到 ${processMonitors.length} 个 TRADER 类型的 ProcessMonitor`);

  for (const processMonitor of processMonitors) {
    const { id, name, config_files, hostServer } = processMonitor;

    // 如果没有配置文件，跳过
    if (!config_files || config_files.length === 0) {
      console.log(`ProcessMonitor ${name} (id: ${id}) 没有配置文件，跳过`);
      continue;
    }

    // 检查 HostServer 信息
    if (!hostServer.ssh_host || !hostServer.ssh_port || !hostServer.ssh_user) {
      console.log(
        `ProcessMonitor ${name} (id: ${id}) 的 HostServer 缺少 SSH 配置，跳过`
      );
      continue;
    }

    console.log(
      `处理 ProcessMonitor ${name} (id: ${id})，HostServer: ${hostServer.ssh_host}:${hostServer.ssh_port}`
    );

    const ssh = new NodeSSH();
    let connected = false;

    try {
      // 连接 SSH
      await ssh.connect({
        host: hostServer.ssh_host,
        port: hostServer.ssh_port,
        username: hostServer.ssh_user,
        privateKeyPath: settings.ssh.local_private_key_path,
      });
      connected = true;

      // 读取所有配置文件内容
      const configs: Array<{ config_file: string; cfg: string }> = [];

      for (const configFile of config_files) {
        try {
          console.log(`  读取配置文件: ${configFile}`);
          const { stdout, stderr, code } = await ssh.execCommand(
            `cat "${configFile}"`
          );

          if (code !== 0 || stderr) {
            console.error(
              `  读取配置文件 ${configFile} 失败: code=${code}, stderr=${stderr}`
            );
            continue;
          }

          configs.push({
            config_file: configFile,
            cfg: stdout,
          });

          console.log(
            `  成功读取配置文件: ${configFile} (${stdout.length} 字符)`
          );
        } catch (error) {
          console.error(`  读取配置文件 ${configFile} 时出错:`, error);
        }
      }

      // 更新 configs 字段
      if (configs.length > 0) {
        await prismaService.processMonitor.update({
          where: { id },
          data: {
            configs: configs,
          },
        });

        console.log(
          `  成功更新 ProcessMonitor ${name} (id: ${id}) 的 configs 字段，共 ${configs.length} 个配置文件`
        );
      } else {
        console.log(
          `  ProcessMonitor ${name} (id: ${id}) 没有成功读取任何配置文件`
        );
      }
    } catch (error) {
      console.error(`处理 ProcessMonitor ${name} (id: ${id}) 时出错:`, error);
    } finally {
      if (connected) {
        ssh?.dispose();
      }
    }
  }

  console.log('完成');
  await app.close();
}

main();
