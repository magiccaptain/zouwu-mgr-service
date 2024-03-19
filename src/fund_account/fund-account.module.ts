import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FundAccount, FundAccountSchema } from './entities/fund-account.entity';
import { FundAccountController } from './fund-account.controller';
import { FundAccountService } from './fund-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FundAccount.name, schema: FundAccountSchema },
    ]),
  ],
  controllers: [FundAccountController],
  providers: [FundAccountService],
})
export class FundAccountModule {}
