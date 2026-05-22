import { Module } from '@nestjs/common';

import { CustomerReportService } from './customer_report.service';

@Module({
  providers: [CustomerReportService],
  exports: [CustomerReportService],
})
export class CustomerReportModule {}
