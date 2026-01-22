// 计算账户市值
import { NestFactory } from '@nestjs/core';
import { FundAccountType } from '@prisma/client';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { AppModule } from '../dist/app.module';
import { FundAccountService } from '../dist/fund_account/fund_account.service';
import { MarketValueService } from '../dist/market-value/market-value.service';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  let tradeDay = process.argv[2];
  if (!tradeDay) {
    tradeDay = dayjs().format('YYYY-MM-DD');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const prismaService = app.get(PrismaService);
  const marketValueService = app.get(MarketValueService);

  let fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
      type: FundAccountType.STOCK,
    },
  });

  fundAccounts = fundAccounts.filter(Boolean);

  await marketValueService.batchCalcActualClosePrice(fundAccounts, tradeDay);

  app.close();
}

main();
