import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { NamespaceDoc } from '../entities/namespace.entity';

import { UpdateNamespaceDto } from './update-namespace.dto';

const sortParams = getSortParams(NamespaceDoc);

export class ListNamespaceQuery extends IntersectionType(
  PickType(UpdateNamespaceDto, ['labels'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  ns_like?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
