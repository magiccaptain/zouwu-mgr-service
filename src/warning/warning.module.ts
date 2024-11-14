import { Module } from '@nestjs/common';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { WarningService } from './warning.service';

@Module({
  imports: [PrismaModule, RemoteCommandModule, HostServerModule],
  providers: [WarningService],
  exports: [WarningService],
})
export class WarningModule {}
