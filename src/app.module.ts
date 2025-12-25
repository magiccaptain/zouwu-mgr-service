import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import memcachedStore from 'cache-manager-memcached-store';
import MemCache from 'memcache-pp';

// eslint-disable-next-line import/order
import { RouteLoggerMiddleware } from './common/route-logger.middleware';
import { settings } from './config';
import { FeishuModule } from './feishu/feishu.module';
import { FundAccountModule } from './fund_account/fund_account.module';
import { HelloController } from './hello.controller';
import { HostServerModule } from './host_server/host_server.module';
import { MarketValueModule } from './market-value/market-value.module';
import { OpsTaskModule } from './ops-task/ops-task.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessMonitorModule } from './process-monitor/process-monitor.module';
import { QuoteModule } from './quote/quote.module';
import { RemoteCommandModule } from './remote-command/remote-command.module';
import { SessionModule } from './session/session.module';
import { ValCalcModule } from './val-calc/val-calc.module';
import { WarningModule } from './warning/warning.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: memcachedStore,
      driver: MemCache,
      // Store-specific configuration:
      options: {
        hosts: [settings.memcached.url],
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    FundAccountModule,
    PrismaModule,
    HostServerModule,
    SessionModule,
    OpsTaskModule,
    ProcessMonitorModule,
    RemoteCommandModule,
    WarningModule,
    QuoteModule,
    MarketValueModule,
    ValCalcModule,
    FeishuModule,
  ],
  controllers: [HelloController],
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
