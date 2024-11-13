import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { RemoteCommandService } from './remote-command.service';

@Module({
  imports: [PrismaModule],
  providers: [RemoteCommandService],
  exports: [RemoteCommandService],
})
export class RemoteCommandModule {}
