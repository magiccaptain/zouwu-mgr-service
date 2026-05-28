import { FeishuService } from 'src/feishu/feishu.service';
import { FundAccountService } from 'src/fund_account';
import { HostServerService } from 'src/host_server/host_server.service';
import { MarketValueService } from 'src/market-value/market-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuoteService } from 'src/quote/quote.service';
import { RemoteCommandService } from 'src/remote-command';
import { ValCalcService } from 'src/val-calc/val-calc.service';
import { WarningService } from 'src/warning/warning.service';

import { OpsTaskService } from './ops-task.service';

describe('OpsTaskService', () => {
  let service: OpsTaskService;
  let prismaService: {
    hostServer: { findMany: jest.Mock };
    opsTask: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(() => {
    prismaService = {
      hostServer: { findMany: jest.fn() },
      opsTask: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new OpsTaskService(
      prismaService as unknown as PrismaService,
      {} as unknown as RemoteCommandService,
      {} as unknown as HostServerService,
      {} as unknown as FundAccountService,
      {} as unknown as WarningService,
      {} as unknown as QuoteService,
      {} as unknown as MarketValueService,
      {} as unknown as ValCalcService,
      {} as unknown as FeishuService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit('should check disk', async () => {
    await service.startAfterCheckHostServerDiskTask();
  }, 10000);

  xit('should check time', async () => {
    await service.startBeforeCheckTimeTask();
  }, 10000);

  xit('should sync fund accounts', async () => {
    await service.startBeforeSyncFundAccountTask();

    console.log('test done');
  }, 10000);
});
