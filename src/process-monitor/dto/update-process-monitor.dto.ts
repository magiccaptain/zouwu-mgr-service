import { PartialType } from '@nestjs/swagger';

import { CreateProcessMonitorDto } from './create-process-monitor.dto';

export class UpdateProcessMonitorDto extends PartialType(
  CreateProcessMonitorDto
) {}
