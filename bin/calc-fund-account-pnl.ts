import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../dist/app.module';
import { PrismaService } from '../dist/prisma/prisma.service';
import { ValCalcService } from '../dist/val-calc/val-calc.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const valCalcService = app.get(ValCalcService);
  const prismaService = app.get(PrismaService);

  let tradeDay = process.argv[2];
  if (!tradeDay) {
    tradeDay = dayjs().format('YYYY-MM-DD');
  }

  const fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
    },
  });

  for (const fundAccount of fundAccounts) {
    const pnl = await valCalcService.calcFundAccountPnl(
      fundAccount.account,
      tradeDay
    );

    console.log(pnl);
  }

  await app.close();
}

main();
