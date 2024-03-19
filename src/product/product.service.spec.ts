import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateProductDto } from './dto/create-product.dto';
import {
  Product,
  PRODUCT_TYPE,
  ProductSchema,
} from './entities/product.entity';
import { ProductService } from './product.service';

const mockProduct = (): CreateProductDto => {
  return {
    name: 'Product 1',
    type: PRODUCT_TYPE.GZ2000_ENHANCE,
  };
};

describe('HostingServerService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let productService: ProductService;
  let productModel: Model<Product>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    productModel = mongoConnection.model<Product>('Product', ProductSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: productModel,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
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
      const toBeCreated = mockProduct();
      const product = await productService.create(toBeCreated);
      expect(product).toBeDefined();
      expect(product).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should return an array of hosting servers', async () => {
      const toBeCreated = mockProduct();
      await productService.create(toBeCreated);
      const list = await productService.list({});
      expect(list).toBeInstanceOf(Array);
      expect(list.length).toBeGreaterThan(0);

      expect(list[0]).toMatchObject(toBeCreated);
    });
  });

  describe('get', () => {
    it('should return a hosting server', async () => {
      const toBeCreated = mockProduct();
      const product = await productService.create(toBeCreated);

      const found = await productService.get(product.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('update', () => {
    it('should update a hosting server', async () => {
      const toBeCreated = mockProduct();
      const product = await productService.create(toBeCreated);

      const updated = await productService.update(product.id, {
        name: 'Product 2',
      });
      expect(updated).toBeDefined();
      expect(updated.name).toEqual('Product 2');
    });
  });

  describe('delete', () => {
    it('should delete a hosting server', async () => {
      const toBeCreated = mockProduct();
      const product = await productService.create(toBeCreated);

      await productService.delete(product.id);
      const found = await productService.get(product.id);
      expect(found).toEqual(null);
    });
  });
});
