import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { TradingCalendarController } from './trading-calendar.controller';
import { TradingCalendarService } from './trading-calendar.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [TradingCalendarController],
  providers: [TradingCalendarService],
  exports: [TradingCalendarService],
})
export class TradingCalendarModule {}
