import { PrismaService } from 'src/prisma/prisma.service';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let prismaService: { session: { findUnique: jest.Mock } };

  beforeEach(() => {
    prismaService = {
      session: { findUnique: jest.fn() },
    };
    service = new SessionService(prismaService as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
