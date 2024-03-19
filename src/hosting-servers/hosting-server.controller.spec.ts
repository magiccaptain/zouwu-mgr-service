import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BROKER } from 'src/broker';
import { settings } from 'src/config';

import { CreateHostingServerDto } from './dto/create-hosting-server.dto';
import { HostingServer, HostingServerSchema, MARKET } from './entities/hosting-server.entity';
import { HostingServerController } from './hosting-server.controller';
import { HostingServerService } from './hosting-server.service';

const mockHostingServer = (name: string): HostingServer => {
  return {
    id: '60a7d9d5a7d5d0001a7d5d00',
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

describe('HostingServerController', () => {
  let controller: HostingServerController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostingServerController],
      providers: [
        {
          provide: HostingServerService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockHostingServer('test')]),
            create: jest.fn().mockResolvedValue(mockHostingServer('test')),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockHostingServer('test')),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockHostingServer('test')),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<HostingServerController>(HostingServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a hosting server', async () => {
      const toBeCreated = mockHostingServer('test');

      const hostingServer = await controller.create(toBeCreated);
      expect(hostingServer).toBeDefined();
      expect(hostingServer).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should list all hosting servers', async () => {
      const hostingServers = await controller.list({} as any, response);
      expect(hostingServers).toBeDefined();
      expect(hostingServers).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a hosting server', async () => {
      const toBeUpdated = mockHostingServer('test');
      const updated = await controller.update(toBeUpdated.id, toBeUpdated);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(toBeUpdated);
    });
  });

  describe('delete', () => {
    it('should delete a hosting server', async () => {
      const toBeDeleted = mockHostingServer('test');
      const deleted = await controller.delete(toBeDeleted.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get a hosting server', async () => {
      const toBeGotten = mockHostingServer('test');
      const gotten = await controller.get(toBeGotten.id);
      expect(gotten).toBeDefined();
      expect(gotten).toMatchObject(toBeGotten);
    });
  });
});
