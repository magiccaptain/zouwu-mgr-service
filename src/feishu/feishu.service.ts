import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

import { settings } from 'src/config';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);

  async notifyMaintenance(msg: string, prefix = '【ZS运维平台】') {
    const webhook = settings.feishu.maintenance_webhook;

    const ret = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: `${prefix} ${msg}`,
        },
      }),
    });

    const firstLine = msg.split('\n')[0];

    if (ret.status !== 200) {
      this.logger.error(
        `NotifyMaintenance http error: status=${ret.status} firstLine=${firstLine}`
      );
      return ret;
    }

    // 飞书自定义机器人 webhook 永远返回 HTTP 200，
    // 真正的成败在响应体 JSON 的 code 字段（0 才是成功，例如 9499/11249 限流、
    // 19021 文本过长、19022 webhook 失效等都是 200 + 非 0 code）。
    const body = await ret.json().catch(() => ({} as Record<string, unknown>));

    if (body.code !== 0) {
      this.logger.error(
        `NotifyMaintenance rejected: code=${body.code} msg=${body.msg} firstLine=${firstLine}`
      );
    } else {
      this.logger.log(`NotifyMaintenance success: ${firstLine}`);
    }

    return ret;
  }
}
