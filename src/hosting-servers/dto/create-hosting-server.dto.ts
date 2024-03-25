import { OmitType } from '@nestjs/swagger';

import { HostingServerDoc } from '../entities/hosting-server.entity';

export class CreateHostingServerDto extends OmitType(HostingServerDoc, [
  'last_check_at',
  'disk_total',
  'disk_free',
  'connect_status',
] as const) {}
