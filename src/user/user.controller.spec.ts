import { Test, TestingModule } from '@nestjs/testing';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUser = (username: string, email: string, phone: string): User => ({
  id: username,
  email,
  name: 'Test User',
  username,
  phone,
  roles: [],
  password: '123456',
  ns: 'haivivi.com/pal',
});

describe('UserController', () => {
  let controller: UserController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockUser('kitty', 'xxx', '123456')]),
            create: jest.fn().mockResolvedValue(mockUser('kitty', 'xxx', '123456')),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockUser('kitty', 'xxx', '123456')),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockUser('kitty', 'xxx', '123456')),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const toBeCreated = mockUser('kitty', 'xxx', '123456');
      const user = await controller.create(toBeCreated);
      expect(user).toBeDefined();

      const { password, ...rest } = toBeCreated;
      expect(user).toMatchObject(rest);
      expect(password).toBeDefined();
    });
  });

  describe('listUser', () => {
    it('should list users', async () => {
      const users = await controller.list({} as any, response);
      expect(users).toBeDefined();
      expect(users).toHaveLength(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const toBeUpdated = mockUser('kitty', 'xxx', '123456');
      const user = await controller.update('kitty', toBeUpdated);
      expect(user).toBeDefined();

      const { password, ...rest } = toBeUpdated;
      expect(user).toMatchObject(rest);
      expect(password).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const deleted = await controller.delete('kitty');
      expect(deleted).toBeUndefined();
    });
  });

  describe('getUser', () => {
    it('should get a user', async () => {
      const user = await controller.get('kitty');
      expect(user).toBeDefined();

      const { password, ...rest } = mockUser('kitty', 'xxx', '123456');
      expect(user).toMatchObject(rest);
      expect(password).toBeDefined();
    });
  });
});
