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

  nodeSSH.connection?.on('close', () => {
    process.exit();
  });

  const zhisui_tools_path = '/data/sc/projects/deyu-quant/zhisui_tools/release';
  const { stdout: version } = await nodeSSH.execCommand(`cat ./version.txt`, {
    cwd: zhisui_tools_path,
  });

  const asset_path = path.join(__dirname, '../assets/zhisui_tools');
  fs.mkdirSync(asset_path, { recursive: true });

  await nodeSSH.getDirectory(asset_path, zhisui_tools_path, { concurrency: 4 });

  nodeSSH.dispose();
}

main();
