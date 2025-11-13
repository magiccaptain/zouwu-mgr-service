import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { NodeSSH } from 'node-ssh';

async function main() {
  const nodeSSH = new NodeSSH();
  await nodeSSH.connect({
    host: '1.119.134.78',
    port: 12701,
    username: 'root',
    privateKeyPath: '/root/.ssh/id_rsa',
  });

  const gom_path = '/data/sc/projects/deyu-quant/gom';

  const asset_path = path.join(__dirname, '../assets/gom');
  fs.mkdirSync(asset_path, { recursive: true });

  await nodeSSH.getDirectory(asset_path, gom_path);

  nodeSSH?.dispose();

  const client = new PrismaClient();

  let servers = await client.hostServer.findMany({
    where: {
      active: true,
    },
  });

  // servers = servers.filter((s) => s.ssh_port === 12744);

  await Promise.all(
    servers.map(async (server) => {
      const { home_dir, ssh_host, ssh_port, ssh_user, brokerKey } = server;

      const zhisui_tools_path = path.join(home_dir!, 'zhisui_tools');
      const remote_gom_path = path.join(zhisui_tools_path, 'gom');

      const ssh = new NodeSSH();
      await ssh.connect({
        host: ssh_host!,
        port: ssh_port!,
        username: ssh_user!,
        privateKeyPath: '/root/.ssh/id_rsa',
      });

      await ssh.putFile(path.join(asset_path, 'gom'), remote_gom_path);

      console.log(brokerKey, ssh_port, 'gom installed');

      ssh?.dispose();
    })
  );
}

main();
