import { PrismaService } from 'src/prisma/prisma.service';

import { RemoteCommandService } from './remote-command.service';

describe('RemoteCommandService', () => {
  let service: RemoteCommandService;
  let prismaService: {
    remoteCommand: { create: jest.Mock; findMany: jest.Mock; update: jest.Mock };
    fundAccount: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prismaService = {
      remoteCommand: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      fundAccount: { findMany: jest.fn() },
    };
    service = new RemoteCommandService(
      prismaService as unknown as PrismaService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
