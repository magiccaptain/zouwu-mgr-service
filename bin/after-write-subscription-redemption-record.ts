// 盘后申赎记录写入

import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../dist/app.module';
import { OpsTaskService } from '../dist/ops-task/ops-task.service';

async function main() {
  const tradeDay = process.argv[2] ?? dayjs().format('YYYY-MM-DD');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const opsTaskService = app.get(OpsTaskService);
    await opsTaskService.startAfterWriteSubscriptionRedemptionRecordTask(
      tradeDay
    );
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});