import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Document } from 'mongoose';

import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

@Schema()
export class TradeDayDoc {
  /**
   * 交易日期
   */
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Prop()
  date: Date;
}

export const TradeDaySchema = helper(SchemaFactory.createForClass(TradeDayDoc));
export class TradeDay extends IntersectionType(TradeDayDoc, MongoEntity) {}
export type TradeDayDocument = Document & TradeDay;
