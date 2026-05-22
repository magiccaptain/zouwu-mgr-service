import { NestFactory } from '@nestjs/core';
import { isEmpty } from 'lodash';

import { AppModule } from '../dist/app.module';
import { PrismaService } from '../dist/prisma/prisma.service';
import { QuoteService } from '../dist/quote/quote.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const quoteService = app.get(QuoteService);

  await quoteService.queryIndexWeight();

  app.close();
}

main();
