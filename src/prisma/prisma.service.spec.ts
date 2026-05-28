jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({
    provider: 'postgres',
    adapterName: 'prisma-pg',
    connect: jest.fn(),
    disconnect: jest.fn(),
    queryRaw: jest.fn(),
    executeRaw: jest.fn(),
    runScriptRaw: jest.fn(),
    startTransaction: jest.fn(),
  })),
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    service = new PrismaService();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
