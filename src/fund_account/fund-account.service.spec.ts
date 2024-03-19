import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { BROKER } from 'src/broker';

import { CreateFundAccountDto } from './dto/create-fund-account.dto';
import {
  FUND_ACCOUNT_STATUS,
  FundAccount,
  FundAccountSchema,
} from './entities/fund-account.entity';
import { FundAccountService } from './fund-account.service';

const mockFundAccount = (): CreateFundAccountDto => {
  return {
    fund_account: '122345',
    status: FUND_ACCOUNT_STATUS.TRADING,
    broker: BROKER.guojun,
  };
};

describe('HostingServerService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let fundAccountService: FundAccountService;
  let fundAccountModel: Model<FundAccount>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    fundAccountModel = mongoConnection.model<FundAccount>(
      'FundAccount',
      FundAccountSchema
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundAccountService,
        {
          provide: getModelToken(FundAccount.name),
          useValue: fundAccountModel,
        },
      ],
    }).compile();

    fundAccountService = module.get<FundAccountService>(FundAccountService);
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
      const toBeCreated = mockFundAccount();
      const fundAccount = await fundAccountService.create(toBeCreated);
      expect(fundAccount).toBeDefined();
      expect(fundAccount).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should return an array of hosting servers', async () => {
      const toBeCreated = mockFundAccount();
      await fundAccountService.create(toBeCreated);
      const allHostingServers = await fundAccountService.list({});
      expect(allHostingServers).toBeInstanceOf(Array);
      expect(allHostingServers.length).toBeGreaterThan(0);

      expect(allHostingServers[0]).toMatchObject(toBeCreated);
    });
  });

  describe('get', () => {
    it('should return a hosting server', async () => {
      const toBeCreated = mockFundAccount();
      const fundAccount = await fundAccountService.create(toBeCreated);

      const found = await fundAccountService.get(fundAccount.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('update', () => {
    it('should update a hosting server', async () => {
      const toBeCreated = mockFundAccount();
      const fundAccount = await fundAccountService.create(toBeCreated);

      const updated = await fundAccountService.update(fundAccount.id, {
        status: FUND_ACCOUNT_STATUS.CLOSED,
      });
      expect(updated).toBeDefined();
      expect(updated.status).toEqual(FUND_ACCOUNT_STATUS.CLOSED);
    });
  });

  describe('delete', () => {
    it('should delete a hosting server', async () => {
      const toBeCreated = mockFundAccount();
      const fundAccount = await fundAccountService.create(toBeCreated);

      await fundAccountService.delete(fundAccount.id);
      const found = await fundAccountService.get(fundAccount.id);
      expect(found).toEqual(null);
    });
  });
});
