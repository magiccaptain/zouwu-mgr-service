import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandService } from 'src/remote-command';

import { HostServerService } from './host_server.service';

describe('HostServerService', () => {
  let service: HostServerService;
  let prismaService: {
    hostServer: { findFirst: jest.Mock; findMany: jest.Mock; update: jest.Mock };
    xTPConfig: { findFirst: jest.Mock };
    fundAccount: { findFirst: jest.Mock };
  };
  let remoteCommandService: jest.Mocked<RemoteCommandService>;

  beforeEach(() => {
    prismaService = {
      hostServer: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      xTPConfig: { findFirst: jest.fn() },
      fundAccount: { findFirst: jest.fn() },
    };
    remoteCommandService = {} as unknown as jest.Mocked<RemoteCommandService>;
    service = new HostServerService(
      prismaService as unknown as PrismaService,
      remoteCommandService
    );
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
