import { Test, TestingModule } from '@nestjs/testing';

import { HostServerService } from 'src/host_server/host_server.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandService } from 'src/remote-command';

import { FundAccountController } from './fund_account.controller';
import { FundAccountService } from './fund_account.service';

describe('FundAccountController', () => {
  let controller: FundAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundAccountController],
      providers: [
        FundAccountService,
        PrismaService,
        HostServerService,
        RemoteCommandService,
      ],
    }).compile();

    controller = module.get<FundAccountController>(FundAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  xit('should check trade time', () => {
    controller.cannotDoInTradeTime();
  });
});
