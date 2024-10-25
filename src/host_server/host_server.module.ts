import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { HostServerService } from './host_server.service';

@Module({
  imports: [PrismaModule],
  providers: [HostServerService],
  exports: [HostServerService],
})
export class HostServerModule {}
