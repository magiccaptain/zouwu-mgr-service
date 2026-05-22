import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { ValCalcService } from './val-calc.service';

@Module({
  imports: [PrismaModule],
  providers: [ValCalcService],
  exports: [ValCalcService],
})
export class ValCalcModule {}
