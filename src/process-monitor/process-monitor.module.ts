import { Module } from '@nestjs/common';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { ProcessMonitorController } from './process-monitor.controller';
import { ProcessMonitorService } from './process-monitor.service';

@Module({
  imports: [PrismaModule, HostServerModule],
  controllers: [ProcessMonitorController],
  providers: [ProcessMonitorService],
  exports: [ProcessMonitorService],
})
export class ProcessMonitorModule {}
