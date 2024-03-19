import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

import { helper } from 'src/lib/mongoose-helper';
import { MongoEntity } from 'src/mongo';

@Schema()
export class NamespaceDoc {
  /**
   * 额外数据
   */
  @IsOptional()
  @IsString()
  @Prop()
  data?: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString()
  @Prop()
  desc?: string;

  /**
   * 标签
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({ type: [String] })
  labels?: string[];

  /**
   * 名称
   */
  @IsNotEmpty()
  @IsString()
  @Prop()
  name: string;

  /**
   * 所属命名空间
   *
   * ns 允许 . 分割，表示命名空间的层级关系
   *
   * 字母开头，允许的字符集 [a-zA-Z0-9-_.]
   */
  @IsNotEmpty()
  @IsString()
  @Prop({ unique: true })
  ns: string;

  /**
   * 父级命名空间
   */
  @IsOptional()
  @IsString()
  @Prop()
  parent?: string;
}

export const NamespaceSchema = helper(
  SchemaFactory.createForClass(NamespaceDoc)
);
export class Namespace extends IntersectionType(NamespaceDoc, MongoEntity) {}
export type NamespaceDocument = Namespace & Document;
