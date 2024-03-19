import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { settings } from 'src/config';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { Namespace, NamespaceSchema } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

const mockNamespace = (ns: string): CreateNamespaceDto => ({
  ns,
  name: 'Test',
});

describe('NamespaceService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: NamespaceService;
  let namespaceModel: Model<Namespace>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    namespaceModel = mongoConnection.model<Namespace>(
      Namespace.name,
      NamespaceSchema
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NamespaceService,
        {
          provide: getModelToken(Namespace.name),
          useValue: namespaceModel,
        },
      ],
    }).compile();

    service = module.get<NamespaceService>(NamespaceService);
  });

  it('should be init', async () => {
    expect(service).toBeDefined();
    jest
      .spyOn(NamespaceService.prototype, 'init')
      .mockReturnValueOnce(Promise.resolve());
    await service.init();
    expect(service.init).toBeCalledTimes(1);

    const initUser = await service.get(settings.init.user.ns);
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

  describe('createNamespace', () => {
    it('should create a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeCreated);
    });
  });

  describe('getNamespace', () => {
    it('should get a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();

      const found = await service.get(namespace.ns);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('deleteNamespace', () => {
    it('should delete a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();

      await service.delete(namespace.id);
      const found = await service.get(namespace.ns);
      expect(found).toEqual(null);
    });
  });

  describe('listNamespace', () => {
    it('should list namespaces', async () => {
      await service.create(mockNamespace('n-1'));
      await service.create(mockNamespace('n-2'));
      await service.create(mockNamespace('n-3'));
      const namespaces = await service.list({});
      expect(namespaces).toBeDefined();
      expect(namespaces).toHaveLength(3);
    });
  });

  describe('countNamespace', () => {
    it('should count namespaces', async () => {
      await service.create(mockNamespace('n-1'));
      const count = await service.count({});
      expect(count).toBe(1);
    });
  });

  describe('updateNamespace', () => {
    it('should update a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      const updateDoc = { name: 'updated name' };
      const updated = await service.update(namespace.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('upsertNamespace', () => {
    it('should upsert a namespace', async () => {
      const toBeUpserted = mockNamespace('n-1');
      const namespace = await service.upsert(toBeUpserted);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeUpserted);
    });
  });
});
