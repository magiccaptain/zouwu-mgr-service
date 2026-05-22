import { Module } from '@nestjs/common';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { QuoteService } from './quote.service';

@Module({
  imports: [HostServerModule, PrismaModule, RemoteCommandModule],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
