import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../src/app.module';
import { QuoteService } from '../src/quote/quote.service';

async function main() {
  let tradeDay = process.argv[2];
  if (!tradeDay) {
    tradeDay = dayjs().format('YYYY-MM-DD');
  }


  const app = await NestFactory.createApplicationContext(AppModule);

  const quoteService = app.get(QuoteService);

  await quoteService.queryQuote(dayjs(tradeDay).format('YYYYMMDD'));
  await quoteService.calcActualClosePrice(tradeDay);

  app.close();
}

main();
