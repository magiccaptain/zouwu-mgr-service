import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { createHash, validateHash } from 'src/lib/crypt';
import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

type CheckPassword = (pwd: string) => boolean;

@Schema()
export class UserDoc {
  /**
   * 头像
   */
  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;

  /**
   * 额外数据
   */
  @IsOptional()
  @IsString()
  @Prop()
  data?: string;

  /**
   * 用户所在地区，存地区编号
   */
  @IsOptional()
  @IsString()
  @Prop()
  district?: string;

  /**
   * 邮箱
   */
  @IsOptional()
  @IsString()
  @Prop({ unique: true, sparse: true })
  email?: string;

  /**
   * 使用语言
   */
  @IsOptional()
  @IsString()
  @Prop()
  language?: string;

  /**
   * 最后活跃时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  lastSeeAt?: Date;

  /**
   * 最后登录 IP
   */
  @IsOptional()
  @IsIP()
  @Prop()
  lastLoginIp?: string;

  /**
   * 真实姓名
   */
  @IsOptional()
  @IsString()
  @Prop()
  name?: string;

  /**
   * 昵称
   */
  @IsOptional()
  @IsString()
  @Prop()
  nickname?: string;

  /**
   * 所属命名空间
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  ns: string;

  /**
   * 真是存储密码的位置，不对外暴露
   */
  @IsOptional()
  @IsString()
  @Prop({ type: String, select: false })
  _password?: string;

  /**
   * 密码
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, writeOnly: true })
  password?: string;

  /**
   * 手机号
   */
  @IsOptional()
  @IsString()
  @Prop({ unique: true, sparse: true })
  phone?: string;

  /**
   * 注册 IP
   */
  @IsOptional()
  @IsIP()
  @Prop()
  registerIp?: string;

  /**
   * 角色
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({ type: [String] })
  roles: string[];

  /**
   * 是否超级管理员
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  super?: boolean;

  /**
   * 用户名
   */
  @IsOptional()
  @IsString()
  @Prop({ unique: true, sparse: true })
  username?: string;

  @ApiHideProperty()
  checkPassword?: CheckPassword;
}

export const UserSchema = helper(SchemaFactory.createForClass(UserDoc));
export class User extends OmitType(IntersectionType(UserDoc, MongoEntity), [
  '_password',
] as const) {}
export type UserDocument = User & Document;

UserSchema.virtual('password').set(function (pwd: string) {
  this._password = createHash(pwd);
});

UserSchema.methods.checkPassword = async function (pwd: string): Promise<boolean> {
  return this._password && validateHash(this._password, pwd);
};
