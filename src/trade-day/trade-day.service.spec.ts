import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateTradeDayDto } from './dto/create-trade-day.dto';
import { TradeDay, TradeDaySchema } from './entities/trade-day.entity';
import { TradeDayService } from './trade-day.service';

const mockTradeDay = (): CreateTradeDayDto => {
  return {
    date: '20240309',
  };
};

describe('HostingServerService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let tradedayService: TradeDayService;
  let tradedayModel: Model<TradeDay>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    tradedayModel = mongoConnection.model<TradeDay>('TradeDay', TradeDaySchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeDayService,
        {
          provide: getModelToken(TradeDay.name),
          useValue: tradedayModel,
        },
      ],
    }).compile();

    tradedayService = module.get<TradeDayService>(TradeDayService);
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
      const toBeCreated = mockTradeDay();
      const tradeday = await tradedayService.create(toBeCreated);
      expect(tradeday).toBeDefined();
      expect(tradeday).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should return an array of hosting servers', async () => {
      const toBeCreated = mockTradeDay();
      await tradedayService.create(toBeCreated);
      const list = await tradedayService.list({});
      expect(list).toBeInstanceOf(Array);
      expect(list.length).toBeGreaterThan(0);

      expect(list[0]).toMatchObject(toBeCreated);
    });

    it('should sort by date', async () => {
      await tradedayService.create({ date: '20240310' });
      await tradedayService.create({ date: '20240308' });
      await tradedayService.create({ date: '20240309' });

      const list = await tradedayService.list({ _sort: 'date' });

      expect(list.length).toBe(3);

      expect(list[0].date).toBe('20240308');
      expect(list[1].date).toBe('20240309');
      expect(list[2].date).toBe('20240310');
    });
  });

  describe('get', () => {
    it('should return a hosting server', async () => {
      const toBeCreated = mockTradeDay();
      const tradeday = await tradedayService.create(toBeCreated);

      const found = await tradedayService.get(tradeday.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject(toBeCreated);
    });
  });

  describe('delete', () => {
    it('should delete a hosting server', async () => {
      const toBeCreated = mockTradeDay();
      const tradeday = await tradedayService.create(toBeCreated);

      await tradedayService.delete(tradeday.id);
      const found = await tradedayService.get(tradeday.id);
      expect(found).toEqual(null);
    });
  });
});
