import { Test, TestingModule } from '@nestjs/testing';

import { TradeDay } from './entities/trade-day.entity';
import { TradeDayController } from './trade-day.controller';
import { TradeDayService } from './trade-day.service';

const mockTradeDay = (): TradeDay => {
  return {
    id: '60a7d9d5a7d5d0001a7d5d00',
    date: '20240301',
  };
};

describe('TradeDayController', () => {
  let controller: TradeDayController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeDayController],
      providers: [
        {
          provide: TradeDayService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockTradeDay()]),
            create: jest.fn().mockResolvedValue(mockTradeDay()),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockTradeDay()),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockTradeDay()),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<TradeDayController>(TradeDayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a tradeday', async () => {
      const toBeCreated = mockTradeDay();

      const tradeday = await controller.create(toBeCreated);
      expect(tradeday).toBeDefined();
      expect(tradeday).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should list all tradedays', async () => {
      const tradedays = await controller.list({} as any, response);
      expect(tradedays).toBeDefined();
      expect(tradedays).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a tradeday', async () => {
      const toBeDeleted = mockTradeDay();
      const deleted = await controller.delete(toBeDeleted.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get a tradeday', async () => {
      const toBeGotten = mockTradeDay();
      const gotten = await controller.get(toBeGotten.id);
      expect(gotten).toBeDefined();
      expect(gotten).toMatchObject(toBeGotten);
    });
  });
});
