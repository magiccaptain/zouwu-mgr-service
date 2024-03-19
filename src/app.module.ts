import { BullModule } from '@nestjs/bull';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import memcachedStore from 'cache-manager-memcached-store';
import MemCache from 'memcache-pp';

import { AuthModule, JwtAuthGuard } from './auth';
import { BrokerModule } from './broker';
// eslint-disable-next-line import/order
import { RouteLoggerMiddleware } from './common/route-logger.middleware';
import { settings } from './config';
import { FundAccountModule } from './fund_account';
import { HelloController } from './hello.controller';
import { HostingServerModule } from './hosting-servers';
import { SessionModule } from './session';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(settings.mongo.url),
    BullModule.forRoot({
      redis: {
        host: settings.redis.host,
        port: settings.redis.port,
        password: settings.redis.password,
      },
    }),
    CacheModule.register({
      isGlobal: true,
      store: memcachedStore,
      driver: MemCache,
      // Store-specific configuration:
      options: {
        hosts: [settings.memcached.url],
      },
    }),
    AuthModule,
    EventEmitterModule.forRoot(),
    SessionModule,
    UserModule,
    BrokerModule,
    HostingServerModule,
    FundAccountModule,
  ],
  controllers: [HelloController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: any) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RouteLoggerMiddleware).forRoutes('*');
  }

  async onModuleDestroy() {
    this.cacheManager.store.getClient((_, { client }) => {
      client.disconnect();
    });
  }
}
