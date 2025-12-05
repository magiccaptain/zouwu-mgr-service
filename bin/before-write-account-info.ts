import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { OpsTaskService } from '../dist/ops-task/ops-task.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const opsTaskService = app.get(OpsTaskService);

  await opsTaskService.startBeforeWriteFundDataTask();

  process.exit(0);
}

main();
