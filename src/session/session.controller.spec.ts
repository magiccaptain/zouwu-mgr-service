import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from 'src/auth';

import { Session } from './entities/session.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

const mockSession = (): Session => ({
  id: 'xxx',
  key: 'xxx',
  expireAt: new Date(),
  subject: '1234',
});

describe('SessionController', () => {
  let controller: SessionController;
  let response: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockSession()]),
            create: jest.fn().mockResolvedValue(mockSession()),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockSession()),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockSession()),
            findByKey: jest.fn().mockResolvedValue(mockSession().key),
            findAndMaybeRefreshKey: jest
              .fn()
              .mockResolvedValue(mockSession().key),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      const toBeCreated = mockSession();
      const session = await controller.create(toBeCreated);
      expect(session).toBeDefined();

      const { expireAt, ...rest } = toBeCreated;
      expect(session).toMatchObject(rest);
      expect(expireAt).toBeDefined();
    });
  });

  describe('listSession', () => {
    it('should list sessions', async () => {
      const sessions = await controller.list({} as any, response);
      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(1);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      const toBeUpdated = mockSession();
      const session = await controller.update('xxx', toBeUpdated);
      expect(session).toBeDefined();

      const { expireAt, ...rest } = toBeUpdated;
      expect(session).toMatchObject(rest);
      expect(expireAt).toBeDefined();
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const deleted = await controller.delete('xxx');
      expect(deleted).toBeUndefined();
    });
  });

  describe('getSession', () => {
    it('should get a session by id', async () => {
      const session = await controller.get('xxx');
      expect(session).toBeDefined();
    });
  });
});
