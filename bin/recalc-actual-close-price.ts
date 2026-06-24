// 重新计算指定交易日 QuoteBrief 的 actual_close_price 和 actual_close_price_date
// 用法: bun run bin/recalc-actual-close-price.ts [tradeDay]
//   tradeDay 可选，格式 YYYY-MM-DD 或 YYYYMMDD，不传则默认今天

import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../dist/app.module';
import { QuoteService } from '../dist/quote/quote.service';

async function main() {
  const rawArg = process.argv[2];

  // 统一转为 YYYYMMDD 格式传给 calcActualClosePrice（其内部会再转为 YYYY-MM-DD）
  let tradeDay: string;
  if (!rawArg) {
    tradeDay = dayjs().format('YYYYMMDD');
    console.log(`未指定日期，默认使用今天: ${dayjs(tradeDay, 'YYYYMMDD').format('YYYY-MM-DD')}`);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawArg)) {
    tradeDay = dayjs(rawArg, 'YYYY-MM-DD').format('YYYYMMDD');
  } else if (/^\d{8}$/.test(rawArg)) {
    tradeDay = rawArg;
  } else {
    console.error('日期格式错误，请使用 YYYY-MM-DD 或 YYYYMMDD 格式');
    process.exit(1);
  }

  const displayDate = dayjs(tradeDay, 'YYYYMMDD').format('YYYY-MM-DD');
  console.log(`开始重新计算 ${displayDate} 的 actual_close_price 和 actual_close_price_date ...`);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const quoteService = app.get(QuoteService);

  await quoteService.calcActualClosePrice(tradeDay);

  console.log(`${displayDate} 的 actual_close_price 和 actual_close_price_date 重新计算完成`);

  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('执行失败:', err);
  process.exit(1);
});
