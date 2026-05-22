import { Test, TestingModule } from '@nestjs/testing';
import { Market } from '@prisma/client';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RemoteCommandModule } from 'src/remote-command';

import { FundAccountService } from './fund_account.service';

describe('FundAccountService', () => {
  let service: FundAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, HostServerModule, RemoteCommandModule],
      providers: [FundAccountService],
    }).compile();

    service = module.get<FundAccountService>(FundAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit('should query fund account from host server', async () => {
    const ret = await service.queryFundAccount('0311040018566660', Market.SH);
    console.log(ret);
  });

  // it('should inner transfer', async () => {
  //   await service.innerTransfer({
  //     fund_account: '0311040018566660',
  //     from: Market.SZ,
  //     amount: 100,
  //   });
  // }, 1000000);
});
