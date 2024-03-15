import { Module } from '@nestjs/common';

import { BrokerController } from './broker.controller';

@Module({
  controllers: [BrokerController],
})
export class BrokerModule {}
