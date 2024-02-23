import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { UserDoc } from '../entities/user.entity';

export class CreateUserDto extends OmitType(UserDoc, [
  'lastSeeAt',
  'lastLoginIp',
  'registerIp',
  'roles',
  '_password',
]) {
  /**
   * 角色
   */
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  /**
   * 密码
   */
  @IsOptional()
  @IsString()
  password?: string;
}
