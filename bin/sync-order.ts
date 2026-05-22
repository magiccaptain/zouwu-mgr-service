// 同步订单数据

import { NestFactory } from '@nestjs/core';
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

  // console.log(fundAccounts);

  for (const fund_account of fundAccounts) {
    const markets = !isEmpty(fund_account.XTPConfig)
      ? fund_account.XTPConfig.map((c) => c.market)
      : fund_account.ATPConfig.map((c) => c.market);

    // if (fund_account.account !== '109277002626') {
    //   continue;
    // }

    for (const market of markets) {
      console.log('begin sync order ', fund_account.account, market);

      // if (market === 'SH') {
      //   continue;
      // }

      try {
        await fundAccountService.queryOrder(fund_account, market);

        console.log(
          `Synced fund account ${fund_account.account} orders for ${fund_account.broker.name} ${market}`
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  app.close();
}

main();
