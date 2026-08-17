import { Module } from '@nestjs/common';

import { FeishuModule } from 'src/feishu/feishu.module';
import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { TradeDataSyncService } from './trade-data-sync.service';
import { TradeDataSyncWriter } from './trade-data-sync.writer';

@Module({
  imports: [PrismaModule, HostServerModule, RemoteCommandModule, FeishuModule],
  providers: [TradeDataSyncService, TradeDataSyncWriter],
  exports: [TradeDataSyncService],
})
export class TradeDataSyncModule {}
