import { Module } from '@nestjs/common';

import { MinioModule } from 'src/minio/minio.module';

import { EmailService } from './email.service';

@Module({
  imports: [MinioModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
