import { NestFactory } from '@nestjs/core';
import { Market } from '@prisma/client';

import { AppModule } from '../dist/app.module';
import { HostServerService } from '../dist/host_server/host_server.service';
import { PrismaService } from '../dist/prisma/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const prismaService = app.get(PrismaService);
  const hostServerService = app.get(HostServerService);

  const fundAccounts = await prismaService.fundAccount.findMany({
    where: {
      active: true,
    },
    include: {
      XTPConfig: true,
      ATPConfig: true,
    },
  });

  // console.log(fundAccounts);

  for (const fund_account of fundAccounts) {
    // if (fund_account.brokerKey !== 'fangzheng') {
    //   continue;
    // }

    if (
      fund_account.XTPConfig.length === 0 &&
      fund_account.ATPConfig.length === 0
    ) {
      console.log(fund_account.brokerKey, fund_account.account);
    }

    // 上海托管机
    const sh_host_server = await prismaService.hostServer.findFirst({
      where: {
        market: Market.SH,
        is_master: true,
        active: true,
        brokerKey: fund_account.brokerKey,
        companyKey: fund_account.companyKey,
      },
    });

    // 深圳托管机
    const sz_host_server = await prismaService.hostServer.findFirst({
      where: {
        market: Market.SZ,
        is_master: true,
        active: true,
        brokerKey: fund_account.brokerKey,
        companyKey: fund_account.companyKey,
      },
    });

    if (fund_account.XTPConfig.length > 0) {
      for (const conf of fund_account.XTPConfig) {
        if (conf.market === Market.SH) {
          if (sh_host_server) {
            await hostServerService.syncTDConfig(sh_host_server, conf);
          } else {
            console.log('No sh host server');
          }
        }

        if (conf.market === Market.SZ) {
          if (sz_host_server) {
            await hostServerService.syncTDConfig(sz_host_server, conf);
          } else {
            console.log('No sz host server');
          }
        }
      }
    }

    if (fund_account.ATPConfig.length > 0) {
      for (const conf of fund_account.ATPConfig) {
        if (conf.market === Market.SH) {
          if (sh_host_server) {
            await hostServerService.syncTDConfig(sh_host_server, conf);
          } else {
            console.log('No sh host server');
          }
        }

        if (conf.market === Market.SZ) {
          if (sz_host_server) {
            await hostServerService.syncTDConfig(sz_host_server, conf);
          } else {
            console.log('No sz host server');
          }
        }
      }
    }
  }

  app.close();
}

main();
