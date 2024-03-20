import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { TradeDayDoc } from '../entities/trade-day.entity';

const sortParams = getSortParams(TradeDayDoc);

export class ListTradeDayQuery extends IntersectionType(
  OmitType(QueryDto, ['_sort'])
) {
  @IsOptional()
  @IsString()
  date_gte?: string;

  @IsOptional()
  @IsString()
  date_lte?: Date;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
