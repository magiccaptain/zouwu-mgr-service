import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TradeDay, TradeDaySchema } from './entities/trade-day.entity';
import { TradeDayController } from './trade-day.controller';
import { TradeDayService } from './trade-day.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TradeDay.name, schema: TradeDaySchema },
    ]),
  ],
  controllers: [TradeDayController],
  providers: [TradeDayService],
  exports: [TradeDayService],
})
export class TradeDayModule {}
