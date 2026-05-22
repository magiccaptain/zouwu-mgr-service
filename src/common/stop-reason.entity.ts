import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class StopReason {
  /**
   * 名称
   */
  @Prop()
  name: string;

  /**
   * 编码
   */
  @Prop()
  code: string;

  /**
   * 等级
   */
  @Prop()
  level?: number;
}
