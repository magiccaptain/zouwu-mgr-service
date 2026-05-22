import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { MarketValueService } from './market-value.service';

@Module({
  imports: [PrismaModule],
  providers: [MarketValueService],
  exports: [MarketValueService],
})
export class MarketValueModule {}
