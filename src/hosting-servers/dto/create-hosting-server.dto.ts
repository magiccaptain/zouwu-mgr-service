import { OmitType } from '@nestjs/swagger';

import { HostingServerDoc } from '../entities/hosting-server.entity';

export class CreateHostingServerDto extends OmitType(
  HostingServerDoc,
  [] as const
) {}
