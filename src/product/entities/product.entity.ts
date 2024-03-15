import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

export enum PRODUCT_TYPE {
  ZZ500_ENHANCE = 'ZZ500_ENHANCE',
  ZZ1000_ENHANCE = 'ZZ1000_ENHANCE',
  GZ2000_ENHANCE = 'GZ2000_ENHANCE',
  ZZ1000_NEUTRAL = 'ZZ1000_NEUTRAL',
  HS300_ENHANCE = 'HS300_ENHANCE',
  QUANT = 'QUANT',
}

export const PRODUCT_TYPE_ENUM = {
  ZZ500_ENHANCE: 'zz500增强',
  ZZ1000_ENHANCE: 'zz1000增强',
  GZ2000_ENHANCE: 'gz2000增强',
  ZZ1000_NEUTRAL: 'zz1000中性',
  HS300_ENHANCE: '沪深300增强',
  QUANT: '量化选股',
};

@Schema()
export class ProductDoc {
  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  name: string;

  @IsNotEmpty()
  @IsEnum(PRODUCT_TYPE)
  @ApiProperty({ enum: PRODUCT_TYPE_ENUM })
  @Prop({ required: true })
  type: PRODUCT_TYPE;
}

export const ProductSchema = helper(SchemaFactory.createForClass(ProductDoc));
export class Product extends IntersectionType(MongoEntity, ProductDoc) {}
export type ProductDocument = Document & ProductDoc;
