import { PartialType } from '@nestjs/swagger';

import { CreateHostingServerDto } from './create-hosting-server.dto';

export class UpdateHostingServerDto extends PartialType(CreateHostingServerDto) {}
