import { Test, TestingModule } from '@nestjs/testing';

import { Namespace } from './entities/namespace.entity';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';

const mockNamespace = (): Namespace => ({
  id: 'xxx',
  ns: 'test',
  name: 'Test',
});

describe('NamespaceController', () => {
  let controller: NamespaceController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NamespaceController],
      providers: [
        {
          provide: NamespaceService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockNamespace()]),
            create: jest.fn().mockResolvedValue(mockNamespace()),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockNamespace()),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockNamespace()),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<NamespaceController>(NamespaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNamespace', () => {
    it('should create a namespace', async () => {
      const toBeCreated = mockNamespace();
      const namespace = await controller.create(toBeCreated);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeCreated);
    });
  });

  describe('listNamespace', () => {
    it('should list namespaces', async () => {
      const namespaces = await controller.list({} as any, response);
      expect(namespaces).toBeDefined();
      expect(namespaces).toHaveLength(1);
    });
  });

  describe('updateNamespace', () => {
    it('should update a namespace', async () => {
      const toBeUpdated = mockNamespace();
      const namespace = await controller.update(toBeUpdated.id, toBeUpdated);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeUpdated);
    });
  });

  describe('deleteNamespace', () => {
    it('should delete a namespace', async () => {
      const deleted = await controller.delete('xxx');
      expect(deleted).toBeUndefined();
    });
  });

  describe('getNamespace', () => {
    it('should get a namespace', async () => {
      const toBeCreated = mockNamespace();
      const namespace = await controller.create(toBeCreated);
      expect(namespace).toBeDefined();

      const found = await controller.get(namespace.ns);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });
});
