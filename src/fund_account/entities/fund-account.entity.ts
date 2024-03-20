import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { BROKER } from 'src/broker';
import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

export enum FUND_ACCOUNT_STATUS {
  TRADING = 'TRADING',
  CLOSED = 'CLOSED',
}

/**
 * 资金账号
 */
@Schema()
export class FundAccountDoc {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '资金账号' })
  @Prop({ required: true, unique: true })
  fund_account: string;

  @IsNotEmpty()
  @IsEnum(FUND_ACCOUNT_STATUS)
  @ApiProperty({ enum: FUND_ACCOUNT_STATUS, enumName: 'FUND_ACCOUNT_STATUS' })
  @Prop({ required: true, default: FUND_ACCOUNT_STATUS.CLOSED })
  status: FUND_ACCOUNT_STATUS;

  @IsNotEmpty()
  @IsEnum(BROKER)
  @ApiProperty({ enum: BROKER, enumName: 'BROKER' })
  @Prop({ required: true })
  broker: BROKER;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '对应的产品' })
  @Prop()
  product?: string;
}

export const FundAccountSchema = helper(
  SchemaFactory.createForClass(FundAccountDoc)
);
export class FundAccount extends IntersectionType(
  MongoEntity,
  FundAccountDoc
) {}
export type FundAccountDocument = Document & FundAccountDoc;
