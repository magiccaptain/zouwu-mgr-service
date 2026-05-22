import { Module } from '@nestjs/common';

import { FeishuModule } from 'src/feishu/feishu.module';
import { FundAccountModule } from 'src/fund_account';
import { HostServerModule } from 'src/host_server/host_server.module';
import { MarketValueModule } from 'src/market-value/market-value.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuoteModule } from 'src/quote/quote.module';
import { RemoteCommandModule } from 'src/remote-command';
import { ValCalcModule } from 'src/val-calc/val-calc.module';
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
    ValCalcModule,
    FeishuModule,
  ],
  providers: [OpsTaskService],
})
export class OpsTaskModule {}
