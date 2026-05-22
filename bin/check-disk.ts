import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { HostServerService } from '../dist/host_server/host_server.service';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const hostServerService = app.get(HostServerService);
  const prismaService = app.get(PrismaService);

  const hostServers = await prismaService.hostServer.findMany({
    where: {
      active: true,
    },
  });

  for (const hostServer of hostServers) {
    await hostServerService.checkDisk(hostServer);
    console.log(`${hostServer.brokerKey} ${hostServer.ssh_port} check done`);
  }

  console.log('done');

  await app.close();
}

main();
