// 盘后进程清理
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { OpsTaskService } from '../dist/ops-task/ops-task.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const opTaskService = app.get(OpsTaskService);

  await opTaskService.startAfterClearProcessesTask();

  app.close();
}

main();
