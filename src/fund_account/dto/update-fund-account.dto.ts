import { PartialType } from '@nestjs/swagger';

import { CreateFundAccountDto } from './create-fund-account.dto';

export class UpdateFundAccountDto extends PartialType(CreateFundAccountDto) {}
