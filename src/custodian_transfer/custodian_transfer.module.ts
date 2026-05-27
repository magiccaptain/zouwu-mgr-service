import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { CustodianTransferController } from './custodian_transfer.controller';
import { CustodianTransferService } from './custodian_transfer.service';

@Module({
  imports: [PrismaModule],
  providers: [CustodianTransferService],
  controllers: [CustodianTransferController],
  exports: [CustodianTransferService],
})
export class CustodianTransferModule {}
