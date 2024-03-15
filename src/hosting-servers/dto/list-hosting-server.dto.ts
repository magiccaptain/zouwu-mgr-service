import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { HostingServerDoc } from '../entities/hosting-server.entity';

const sortParams = getSortParams(HostingServerDoc);

export class ListHostingServerQuery extends IntersectionType(
  PickType(HostingServerDoc, ['name', 'broker', 'market'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
