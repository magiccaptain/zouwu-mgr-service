import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';

import { BROKER } from 'src/broker';
import { helper } from 'src/lib/mongoose-helper';
import { SortFields } from 'src/lib/sort';
import { MongoEntity } from 'src/mongo';

/**
 * 市场
 */
export enum MARKET {
  SH = 'SH',
  SZ = 'SZ',
}

/**
 * 托管机
 */
@Schema()
@SortFields(['broker'])
export class HostingServerDoc {
  /**
   * 名称
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  name: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString()
  @Prop()
  desc?: string;

  /**
   * 在托管机房的主机ip
   */
  @IsOptional()
  @IsString()
  @Prop()
  host_ip?: string;

  /**
   * 所属券商
   */
  @IsOptional()
  @IsEnum(BROKER)
  @ApiProperty({ enum: BROKER, enumName: 'BROKER' })
  @Prop()
  broker?: BROKER;

  /**
   * 所属市场
   */
  @IsOptional()
  @IsEnum(MARKET)
  @ApiProperty({ enum: MARKET, enumName: 'MARKET' })
  @Prop()
  market?: MARKET;

  /**
   * ssh 登录host
   */
  @IsOptional()
  @IsString()
  @Prop()
  ssh_host?: string;

  /**
   * ssh 登录用户名
   */
  @IsOptional()
  @IsString()
  @Prop()
  ssh_user?: string;

  /**
   * ssh 登录端口
   */
  @IsOptional()
  @IsNumber()
  @Prop()
  ssh_port?: number;

  /**
   * home路径
   */
  @IsOptional()
  @IsString()
  @Prop()
  home_dir?: string;

  /**
   * 上次检查时间
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Prop()
  last_check_at?: Date;

  /**
   * 联通状态
   */
  @IsOptional()
  @IsBoolean()
  @Prop()
  connect_status?: boolean;

  /**
   * 磁盘总容量 GB
   */
  @IsOptional()
  @IsNumber()
  @Prop()
  disk_total?: number;

  /**
   * 磁盘剩余容量 GB
   */
  @IsOptional()
  @IsNumber()
  @Prop()
  disk_free?: number;
}

export const HostingServerSchema = helper(
  SchemaFactory.createForClass(HostingServerDoc)
);
export class HostingServer extends IntersectionType(
  HostingServerDoc,
  MongoEntity
) {}
export type HostingServerDocument = HostingServer & Document;
