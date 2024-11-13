import { Module } from '@nestjs/common';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { FundAccountController } from './fund_account.controller';
import { FundAccountService } from './fund_account.service';

@Module({
  imports: [PrismaModule, HostServerModule, RemoteCommandModule],
  providers: [FundAccountService],
  controllers: [FundAccountController],
  exports: [FundAccountService],
})
export class FundAccountModule {}
