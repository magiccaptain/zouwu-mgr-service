import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/common';
import { getSortParams } from 'src/lib/sort';

import { UserDoc } from '../entities/user.entity';

import { UpdateUserDto } from './update-user.dto';

const sortParams = getSortParams(UserDoc);

export class ListUserQuery extends IntersectionType(
  PickType(UpdateUserDto, ['email', 'name', 'phone', 'district', 'ns', 'roles'] as const),
  OmitType(QueryDto, ['_sort'])
) {
  /**
   * 名称 模糊查询
   */
  @IsOptional()
  @IsString()
  name_like?: string;

  /**
   * 昵称 模糊查询
   */
  @IsOptional()
  @IsString()
  nickname_like?: string;

  /**
   * 所属命名空间 模糊查询
   */
  @IsOptional()
  @IsString()
  ns_start?: string;

  /**
   * 排序参数
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: sortParams })
  _sort?: (typeof sortParams)[number];
}
