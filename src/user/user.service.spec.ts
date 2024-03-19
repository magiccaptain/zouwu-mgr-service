import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { settings } from 'src/config';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserSchema } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser: CreateUserDto = {
  email: 'aaa@aa.com',
  name: 'kitty',
  password: '123456',
  username: 'kitty',
  ns: 'haivivi.com/pal',
};

describe('UserService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: UserService;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model<User>(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be init', async () => {
    expect(service).toBeDefined();
    jest
      .spyOn(UserService.prototype, 'init')
      .mockReturnValueOnce(Promise.resolve());
    await service.init();
    expect(service.init).toBeCalledTimes(1);

    const initUser = await service.findByLogin(settings.init.user.username);
    expect(initUser).toBeDefined();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const user = await service.create(mockUser);
      expect(user).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(user).toMatchObject(rest);
      expect(user.checkPassword(password)).toBeTruthy();
    });
  });

  describe('findByLogin', () => {
    it('should find a user by login', async () => {
      const user = await service.create(mockUser);
      const found = await service.findByLogin(user.username);
      expect(found).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(found).toMatchObject(rest);
      expect(await found.checkPassword(password)).toBeFalsy();
    });
  });

  describe('findByLoginWithPassword', () => {
    it('should find a user by login', async () => {
      const user = await service.create(mockUser);
      const found = await service.findByLoginWithPassword(user.username);
      expect(found).toBeDefined();
      expect(await found.checkPassword(mockUser.password)).toBeTruthy();
    });
  });

  describe('countUser', () => {
    it('should count users', async () => {
      await service.create(mockUser);
      const count = await service.count({});
      expect(count).toBe(1);
    });
  });

  describe('listUser', () => {
    it('should list users', async () => {
      await service.create(mockUser);
      const users = await service.list({});
      expect(users).toBeDefined();
      expect(users).toHaveLength(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = await service.create(mockUser);
      const updateDoc = { name: 'updated name' };
      const updated = await service.update(user.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const user = await service.create(mockUser);
      await service.delete(user.id);
      const found = await service.get(user.id);
      expect(found).toEqual(null);
    });
  });

  describe('getUser', () => {
    it('should get a user', async () => {
      const user = await service.create(mockUser);
      const found = await service.get(user.id);
      expect(found).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(found).toMatchObject(rest);
      expect(found.checkPassword(password)).toBeTruthy();
    });
  });

  describe('upsertUser', () => {
    it('should upsert a user', async () => {
      const user = await service.upsert(mockUser);
      expect(user).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(user).toMatchObject(rest);
      expect(user.checkPassword(password)).toBeTruthy();
    });
  });
});
