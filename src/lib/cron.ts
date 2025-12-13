import { Cron as NestCron } from '@nestjs/schedule';

import { settings } from 'src/config';

/**
 * 自定义 Cron 装饰器
 * 根据 settings.cron.cron_task_switch 配置决定是否启用定时任务
 * 当 cron_task_switch 为 'on' 时，应用原 @Cron 装饰器
 * 当 cron_task_switch 为 'off' 时，不应用装饰器（定时任务不会执行）
 *
 * @param cronExpression - Cron 表达式
 * @returns 装饰器函数
 */
export function Cron(cronExpression: string) {
  // 检查定时任务开关
  if (settings.cron.task_switch === 'on') {
    // 如果开关为 'on'，应用原 @Cron 装饰器
    return NestCron(cronExpression);
  }
  // 如果开关为 'off'，返回一个空装饰器（不执行任何操作）
  // 这个装饰器不会注册任何定时任务
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor | void {
    // 空装饰器，不执行任何操作，保持原方法描述符不变
    return descriptor;
  };
}
