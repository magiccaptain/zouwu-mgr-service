import { Module } from '@nestjs/common';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { FundAccountController } from './fund_account.controller';
import { FundAccountService } from './fund_account.service';

@Module({
  imports: [PrismaModule, HostServerModule],
  providers: [FundAccountService],
  controllers: [FundAccountController],
})
export class FundAccountModule {}
