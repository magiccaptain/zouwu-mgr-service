import { Test, TestingModule } from '@nestjs/testing';

import { Product, PRODUCT_TYPE } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

const mockProduct = (): Product => {
  return {
    id: '60a7d9d5a7d5d0001a7d5d00',
    name: 'Product 1',
    type: PRODUCT_TYPE.GZ2000_ENHANCE,
  };
};

describe('ProductController', () => {
  let controller: ProductController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockProduct()]),
            create: jest.fn().mockResolvedValue(mockProduct()),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockProduct()),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockProduct()),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const toBeCreated = mockProduct();

      const product = await controller.create(toBeCreated);
      expect(product).toBeDefined();
      expect(product).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should list all products', async () => {
      const products = await controller.list({} as any, response);
      expect(products).toBeDefined();
      expect(products).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const toBeUpdated = mockProduct();
      const updated = await controller.update(toBeUpdated.id, toBeUpdated);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(toBeUpdated);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const toBeDeleted = mockProduct();
      const deleted = await controller.delete(toBeDeleted.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get a product', async () => {
      const toBeGotten = mockProduct();
      const gotten = await controller.get(toBeGotten.id);
      expect(gotten).toBeDefined();
      expect(gotten).toMatchObject(toBeGotten);
    });
  });
});
