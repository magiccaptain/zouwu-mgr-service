// 同步fund account数据

import { NestFactory } from '@nestjs/core';
import { InnerFundSnapshotReason } from '@prisma/client';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { AppModule } from '../dist/app.module';
import { FundAccountService } from '../dist/fund_account/fund_account.service';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prismaService = app.get(PrismaService);
  const fundAccountService = app.get(FundAccountService);

  const fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
    },
    include: {
      XTPConfig: true,
      ATPConfig: true,
      broker: true,
    },
  });

  let reason: InnerFundSnapshotReason = InnerFundSnapshotReason.SYNC;
  const now = dayjs();

  if (now.hour() <= 9) {
    reason = InnerFundSnapshotReason.BEFORE_TRADING_DAY;
  } else if (now.hour() >= 15) {
    reason = InnerFundSnapshotReason.AFTER_TRADING_DAY;
  }

  console.log(fundAccounts)

  for (const fund_account of fundAccounts) {
    // if (fund_account.account !== '0331040028136983') {
    //   continue;
    // }

    console.log("begin sync account", fund_account.account);

    const markets = !isEmpty(fund_account.XTPConfig)
      ? fund_account.XTPConfig.map((c) => c.market)
      : fund_account.ATPConfig.map((c) => c.market);

    for (const market of markets) {
      await fundAccountService.syncFundAccount(
        fund_account.account,
        market,
        reason
      );

      console.log(
        `Synced fund account ${fund_account.account} for ${fund_account.broker.name} ${market}`
      );
    }
  }

  app.close();
}

main();
