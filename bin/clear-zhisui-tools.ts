import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { HostServerService } from '../dist/host_server/host_server.service';
import { PrismaService } from '../dist/prisma/prisma.service';
import { RemoteCommandService } from '../dist/remote-command/remote-command.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prismaService = app.get(PrismaService);
  const hostServerService = app.get(HostServerService);
  const remoteCommandService = app.get(RemoteCommandService);

  const hostServers = await prismaService.hostServer.findMany({
    where: {
      active: true,
    },
  });

  for (const hostServer of hostServers) {
    const remoteCommand = await remoteCommandService.makePkillTraderTool(
      hostServer
    );
    await hostServerService.execRemoteCommand(remoteCommand);
    console.log(`清理 ${hostServer.brokerKey} ${hostServer.ssh_port} 进程完成`);
  }

  await app.close();
}

main();
