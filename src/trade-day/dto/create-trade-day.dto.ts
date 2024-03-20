import { OmitType } from '@nestjs/swagger';

import { TradeDayDoc } from '../entities/trade-day.entity';

export class CreateTradeDayDto extends OmitType(TradeDayDoc, [] as const) {}
