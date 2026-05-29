import { Market, TradingCalendar } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SyncTradingCalendarDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  @Max(2100)
  start_year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  @Max(2100)
  end_year?: number;
}

export class UpdateTradingCalendarDto {
  @IsBoolean()
  is_open: boolean;
}

export class SyncResultEntity {
  total: number;
  created: number;
  updated: number;
}

export class TradingCalendarEntity implements TradingCalendar {
  id: number;
  market: Market;
  cal_date: string;
  is_open: boolean;
}
