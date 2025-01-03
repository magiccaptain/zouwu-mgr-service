import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

import { HostServerService } from './host_server.service';

describe('HostServerService', () => {
  let service: HostServerService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [HostServerService],
    }).compile();

    service = module.get<HostServerService>(HostServerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit('should sync xtp config', async () => {
    const hostServer = await prismaService.hostServer.findFirst({
      where: {
        active: true,
        is_master: true,
        brokerKey: 'xtp',
      },
    });

    const xtpConfig = await prismaService.xTPConfig.findFirst({});

    await service.syncTDConfig(hostServer, xtpConfig);
  });

  xit('should sync atp config', async () => {
    const fundAccount = await prismaService.fundAccount.findFirst({
      where: {
        brokerKey: 'guojun',
      },
      include: {
        ATPConfig: true,
      },
    });

    const { ATPConfig = [] } = fundAccount;

    for (const atpConfig of ATPConfig) {
      const hostServer = await prismaService.hostServer.findFirst({
        where: {
          active: true,
          is_master: true,
          brokerKey: 'guojun',
          market: atpConfig.market,
        },
      });
      await service.syncTDConfig(hostServer, atpConfig);
    }
  });
});
