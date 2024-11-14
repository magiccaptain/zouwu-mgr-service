import { Module } from '@nestjs/common';

import { FundAccountModule } from 'src/fund_account';
import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';
import { WarningModule } from 'src/warning/warning.module';

import { OpsTaskService } from './ops-task.service';

@Module({
  imports: [
    HostServerModule,
    PrismaModule,
    RemoteCommandModule,
    FundAccountModule,
    WarningModule,
  ],
  providers: [OpsTaskService],
})
export class OpsTaskModule {}
