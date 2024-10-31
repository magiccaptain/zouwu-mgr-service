// 同步fund account数据

import { NestFactory } from '@nestjs/core';
import { InnerFundSnapshotReason } from '@prisma/client';
import { isEmpty } from 'lodash';

import { AppModule } from '../dist/app.module';
import { FundAccountService } from '../dist/fund_account/fund_account.service';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  const fundAccountService = app.get(FundAccountService);

  const fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
    },
    include: {
      XTPConfig: true,
      ATPConfig: true,
    },
  });

  for (const fund_account of fundAccounts) {
    const markets = !isEmpty(fund_account.XTPConfig)
      ? fund_account.XTPConfig.map((c) => c.market)
      : fund_account.ATPConfig.map((c) => c.market);

    for (const market of markets) {
      await fundAccountService.syncFundAccount(
        fund_account.account,
        market,
        InnerFundSnapshotReason.AFTER_TRADING_DAY
      );
    }
  }

  app.close();
}

main();
