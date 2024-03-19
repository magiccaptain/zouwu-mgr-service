import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  HostingServer,
  HostingServerSchema,
} from './entities/hosting-server.entity';
import { HostingServerController } from './hosting-server.controller';
import { HostingServerService } from './hosting-server.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HostingServer.name, schema: HostingServerSchema },
    ]),
  ],
  controllers: [HostingServerController],
  providers: [HostingServerService],
})
export class HostingServerModule {}
