import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { ProductDoc } from '../entities/product.entity';

import { UpdateProductDto } from './update-product.dto';

const sortParams = getSortParams(ProductDoc);

export class ListProductQuery extends IntersectionType(
  PickType(UpdateProductDto, ['name', 'type'] as const),
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
