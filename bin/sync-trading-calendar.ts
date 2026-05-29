import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { TradingCalendarService } from '../src/trading-calendar/trading-calendar.service';

async function main() {
  const currentYear = new Date().getFullYear();
  const startYear = Number(process.argv[2]) || currentYear - 5;
  const endYear = Number(process.argv[3]) || currentYear;

  console.log(`同步交易日历: ${startYear} - ${endYear}`);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const service = app.get(TradingCalendarService);
  const result = await service.sync(startYear, endYear);

  console.log(`同步完成: 共 ${result.total} 条, 新增 ${result.created} 条, 更新 ${result.updated} 条`);

  await app.close();
}

main().catch((err) => {
  console.error('同步失败:', err.message || err);
  process.exit(1);
});
