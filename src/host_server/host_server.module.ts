import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { HostServerController } from './host_server.controller';
import { HostServerService } from './host_server.service';

@Module({
  imports: [PrismaModule, RemoteCommandModule],
  controllers: [HostServerController],
  providers: [HostServerService],
  exports: [HostServerService],
})
export class HostServerModule {}
