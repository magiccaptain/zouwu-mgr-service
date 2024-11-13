import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from 'src/prisma/prisma.module';

import { RemoteCommandService } from './remote-command.service';

describe('RemoteCommandService', () => {
  let service: RemoteCommandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [RemoteCommandService],
    }).compile();

    service = module.get<RemoteCommandService>(RemoteCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
