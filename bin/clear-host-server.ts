import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { PrismaService } from '../dist/prisma/prisma.service';
import { WarningService } from '../dist/warning/warning.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const warningService = app.get(WarningService);
  const prismaService = app.get(PrismaService);

  let hostServer = await prismaService.hostServer.findFirst({
    where: {
      ssh_port: 12703,
    },
  });

  if (hostServer) {
    hostServer = await warningService.clearDisk(hostServer);
  }

  console.log(hostServer);

  await app.close();
}

main();
