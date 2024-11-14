// inner transfer

import { NestFactory } from '@nestjs/core';
import { Market } from '@prisma/client';

import { AppModule } from '../dist/app.module';
import { TransferDirection } from '../dist/fund_account/fund_account.dto';
import { FundAccountService } from '../dist/fund_account/fund_account.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const fundAccountService = app.get(FundAccountService);

  const ret = await fundAccountService.externalTransfer('106110007069', {
    market: Market.SH,
    amount: 100,
    direction: TransferDirection.IN,
  });

  console.log(ret);

  app.close();
}

main();
