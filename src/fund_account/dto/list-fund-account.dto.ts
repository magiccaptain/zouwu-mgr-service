import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { FundAccountDoc } from '../entities/fund-account.entity';

import { UpdateFundAccountDto } from './update-fund-account.dto';

const sortParams = getSortParams(FundAccountDoc);

export class ListFundAccountQuery extends IntersectionType(
  PickType(UpdateFundAccountDto, [
    'fund_account',
    'broker',
    'status',
    'product',
  ] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
