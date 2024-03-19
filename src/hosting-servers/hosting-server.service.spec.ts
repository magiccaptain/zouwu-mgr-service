import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BROKER } from 'src/broker';

import { CreateHostingServerDto } from './dto/create-hosting-server.dto';
import {
  HostingServer,
  HostingServerSchema,
  MARKET,
} from './entities/hosting-server.entity';
import { HostingServerService } from './hosting-server.service';

const mockHostingServer = (name: string): CreateHostingServerDto => {
  return {
    name: name,
    desc: '中泰上海12702服务器',
    market: MARKET.SH,
    ssh_host: 'localhost',
    ssh_port: 12702,
    host_ip: '192.168.1.1',
    broker: BROKER.xtp,
    home_dir: '/home/admin',
  };
};

describe('HostingServerService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let hostingServerService: HostingServerService;
  let hostingServerModel: Model<HostingServer>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    hostingServerModel = mongoConnection.model<HostingServer>(
      'HostingServer',
      HostingServerSchema
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostingServerService,
        {
          provide: getModelToken(HostingServer.name),
          useValue: hostingServerModel,
        },
      ],
    }).compile();

    hostingServerService =
      module.get<HostingServerService>(HostingServerService);
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

  describe('create', () => {
    it('should create a hosting server', async () => {
      const toBeCreated = mockHostingServer('中泰上海12702');
      const hostingServer = await hostingServerService.create(toBeCreated);
      expect(hostingServer).toBeDefined();
      expect(hostingServer).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should return an array of hosting servers', async () => {
      const toBeCreated = mockHostingServer('中泰上海12702');
      await hostingServerService.create(toBeCreated);
      const lists = await hostingServerService.list({});
      expect(lists).toBeInstanceOf(Array);
      expect(lists.length).toBeGreaterThan(0);

      expect(lists[0]).toMatchObject(toBeCreated);
    });
  });

  describe('get', () => {
    it('should return a hosting server', async () => {
      const toBeCreated = mockHostingServer('中泰上海12702');
      const hostingServer = await hostingServerService.create(toBeCreated);

      const found = await hostingServerService.get(hostingServer.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('update', () => {
    it('should update a hosting server', async () => {
      const toBeCreated = mockHostingServer('中泰上海12702');
      const hostingServer = await hostingServerService.create(toBeCreated);

      const updated = await hostingServerService.update(hostingServer.id, {
        desc: '中泰上海12702服务器(更新)',
      });
      expect(updated).toBeDefined();
      expect(updated.desc).toBe('中泰上海12702服务器(更新)');
    });
  });

  describe('delete', () => {
    it('should delete a hosting server', async () => {
      const toBeCreated = mockHostingServer('中泰上海12702');
      const hostingServer = await hostingServerService.create(toBeCreated);

      await hostingServerService.delete(hostingServer.id);
      const found = await hostingServerService.get(hostingServer.id);
      expect(found).toEqual(null);
    });
  });
});
