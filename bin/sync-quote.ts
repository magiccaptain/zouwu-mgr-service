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

  const quoteService = app.get(QuoteService);

  await quoteService.calcActualClosePrice(tradeDay);

  // await quoteService.queryQuote();

  app.close();
}

main();
