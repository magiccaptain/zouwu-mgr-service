// 计算账户市值
import { NestFactory } from '@nestjs/core';
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

  const fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
    },
  });

  for (const fundAccount of fundAccounts) {
    // if (fundAccount.account !== '109277002626') {
    //   continue;
    // }

    await marketValueService.calcMarketValue(fundAccount, tradeDay);

    console.log(
      `Calculated market value for ${fundAccount.brokerKey} ${fundAccount.account} on ${tradeDay}`
    );
  }

  app.close();
}

main();
