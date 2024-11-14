import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { HostServerService } from './host_server.service';

@Module({
  imports: [PrismaModule, RemoteCommandModule],
  providers: [HostServerService],
  exports: [HostServerService],
})
export class HostServerModule {}
