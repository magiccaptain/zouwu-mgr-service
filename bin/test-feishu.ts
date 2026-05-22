import { NestFactory } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import { FeishuService } from '../dist/feishu/feishu.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const feishuService = app.get(FeishuService);
  const ret = await feishuService.notifyMaintenance('test');
  console.log(ret);
  app.close();
}

main();
