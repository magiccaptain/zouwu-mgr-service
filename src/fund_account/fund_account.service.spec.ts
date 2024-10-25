import { Test, TestingModule } from '@nestjs/testing';
import { Market } from '@prisma/client';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { FundAccountService } from './fund_account.service';

describe('FundAccountService', () => {
  let service: FundAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, HostServerModule],
      providers: [FundAccountService],
    }).compile();

    service = module.get<FundAccountService>(FundAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query fund account from host server', async () => {
    await service.queryStockAccountFromHostServer('109277002626', Market.SH);
  });
});
