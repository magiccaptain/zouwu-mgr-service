import { Injectable, Logger } from '@nestjs/common';

import { settings } from 'src/config';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);

  async notifyMaintenance(msg: string, prefix = '【运维平台】') {
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

    if (ret.status !== 204) {
      this.logger.error('NotifyMaintenance error', ret);
    } else {
      this.logger.log(`NotifyMaintenance success: ${msg}`);
    }
  }
}
