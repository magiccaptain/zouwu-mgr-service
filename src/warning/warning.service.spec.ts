import { HostServerService } from 'src/host_server/host_server.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { WarningService } from './warning.service';

describe('WarningService', () => {
  let service: WarningService;
  let prismaService: {
    remoteCommand: { create: jest.Mock };
    opsWarning: { update: jest.Mock };
  };
  let hostServerService: jest.Mocked<HostServerService>;

  beforeEach(() => {
    prismaService = {
      remoteCommand: { create: jest.fn() },
      opsWarning: { update: jest.fn() },
    };
    hostServerService = {
      batchExecRemoteCommand: jest.fn(),
      checkDisk: jest.fn(),
    } as unknown as jest.Mocked<HostServerService>;
    service = new WarningService(
      prismaService as unknown as PrismaService,
      hostServerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
