import { OmitType } from '@nestjs/swagger';

import { FundAccountDoc } from '../entities/fund-account.entity';

export class CreateFundAccountDto extends OmitType(
  FundAccountDoc,
  [] as const
) {}
