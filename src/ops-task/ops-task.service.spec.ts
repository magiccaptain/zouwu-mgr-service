import { Test, TestingModule } from '@nestjs/testing';

import { FundAccountModule } from 'src/fund_account';
import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { OpsTaskService } from './ops-task.service';

describe('OpsTaskService', () => {
  let service: OpsTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        RemoteCommandModule,
        HostServerModule,
        FundAccountModule,
      ],
      providers: [OpsTaskService],
    }).compile();

    service = module.get<OpsTaskService>(OpsTaskService);
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
