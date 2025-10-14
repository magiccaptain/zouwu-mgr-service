import { Module } from '@nestjs/common';

import { FundAccountModule } from 'src/fund_account';
import { HostServerModule } from 'src/host_server/host_server.module';
import { MarketValueModule } from 'src/market-value/market-value.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuoteModule } from 'src/quote/quote.module';
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
    QuoteModule,
    MarketValueModule,
  ],
  providers: [OpsTaskService],
})
export class OpsTaskModule {}
