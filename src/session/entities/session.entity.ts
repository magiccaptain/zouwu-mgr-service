import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

@Schema()
export class SessionDoc {
  /**
   * 会话过期时间
   */
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Prop({ expires: '10s' })
  expireAt: Date;

  /**
   * refresh token key
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  key: string;

  /**
   * 用户
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  subject: string;

  /**
   * 客户端
   */
  @IsOptional()
  @IsString()
  @Prop()
  client?: string;
}

export const SessionSchema = helper(SchemaFactory.createForClass(SessionDoc));
export class Session extends IntersectionType(SessionDoc, MongoEntity) {}
export type SessionDocument = Session & Document;

export class OnlyToken {
  /**
   * token
   */
  token: string;

  /**
   * token 过期时间
   */
  tokenExpireAt: Date;
}

export class SessionWithToken extends IntersectionType(Session, OnlyToken) {}
