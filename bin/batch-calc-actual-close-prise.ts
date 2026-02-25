import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { AppModule } from '../dist/app.module';
import { PrismaService } from '../dist/prisma/prisma.service';
import { QuoteService } from '../dist/quote/quote.service';

async function main() {
  let tradeDay = process.argv[2];
  if (!tradeDay) {
    tradeDay = dayjs().format('YYYY-MM-DD');
  }
  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  const quoteService = app.get(QuoteService);

  // 通过distinct tradeDay查询出所有的tradeDay
  const groupdByTradeDay = await prismaService.quoteBrief.groupBy({
    by: ['tradeDay'],
  });

  const tradeDays = groupdByTradeDay.map((item) => item.tradeDay);

  console.log(tradeDays);

  for (const tradeDay of tradeDays) {
    if (tradeDay <= '2025-12-31') {
      continue;
    }

    if (tradeDay >= '2026-01-19') {
      continue;
    }

    console.log(`Calculating actual close price for ${tradeDay}`);

    await quoteService.calcActualClosePrice(tradeDay);
  }

  app.close();
  process.exit(0);
}

main();
