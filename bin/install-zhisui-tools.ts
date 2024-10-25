import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { NodeSSH } from 'node-ssh';

async function main() {
  const client = new PrismaClient();

  const servers = await client.hostServer.findMany({
    where: {
      active: true,
    },
  });

  const assetPath = path.join(__dirname, '../assets/zhisui_tools');

  const localVersion = fs.readFileSync(
    path.join(assetPath, 'version.txt'),
    'utf-8'
  );

  for (const server of servers) {
    const { brokerKey, ssh_host, ssh_port, ssh_user, home_dir } = server;

    const pkgPath = path.join(assetPath, brokerKey);

    if (!fs.existsSync(pkgPath)) {
      console.log(
        `${ssh_user}@${ssh_host} ${ssh_port}: no zhisui_tools release for ${brokerKey}, skip`
      );
      continue;
    }

    console.log(
      `install zhisui_tools to ${brokerKey} ${ssh_user}@${ssh_host} ${ssh_port}`
    );

    const ssh = new NodeSSH();

    await ssh.connect({
      host: ssh_host!,
      port: ssh_port!,
      username: ssh_user!,
      privateKeyPath: '/root/.ssh/id_rsa',
    });

    const remotePath = path.join(home_dir!, 'zhisui_tools');

    const { stdout: remoteVersion } = await ssh.execCommand(
      `cat ${remotePath}/version.txt`
    );

    if (remoteVersion.trim() === localVersion.trim()) {
      ssh.dispose();
      console.log(`zhisui_tools is already up-to-date, skip...`);
      continue;
    }

    // 读取pkgPath 下的所有文件
    const files = fs.readdirSync(pkgPath);

    for (const file of files) {
      const localPath = path.join(pkgPath, file);

      // 远程创建remotePath
      await ssh.execCommand(`mkdir -p ${remotePath}`);
      // 复制文件
      await ssh.putFile(localPath, path.join(remotePath, file));
    }

    // copy version.txt
    await ssh.putFile(
      path.join(assetPath, 'version.txt'),
      path.join(remotePath, 'version.txt')
    );

    // chmod +x trade_data_pull
    await ssh.execCommand(`chmod +x ${remotePath}/trade_data_pull`);
    // chmod +x trader_tools
    await ssh.execCommand(`chmod +x ${remotePath}/trader_tools`);

    ssh.dispose();
  }

  console.log('install done');
}

main();
