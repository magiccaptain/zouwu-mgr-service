import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Document } from 'mongoose';

import { helper } from 'src/lib/mongoose-helper';
import { SortFields } from 'src/lib/sort';
import { MongoEntity } from 'src/mongo';

@Schema()
@SortFields(['date'])
export class TradeDayDoc {
  /**
   * 交易日期 YYYYMMDD
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{8}$/)
  @Prop({ unique: true })
  date: string;
}

export const TradeDaySchema = helper(SchemaFactory.createForClass(TradeDayDoc));
export class TradeDay extends IntersectionType(TradeDayDoc, MongoEntity) {}
export type TradeDayDocument = Document & TradeDay;
