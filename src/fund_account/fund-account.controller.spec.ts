import { Test, TestingModule } from '@nestjs/testing';

import { BROKER } from 'src/broker';

import {
  FUND_ACCOUNT_STATUS,
  FundAccount,
} from './entities/fund-account.entity';
import { FundAccountController } from './fund-account.controller';
import { FundAccountService } from './fund-account.service';

const mockFundAccount = (): FundAccount => {
  return {
    id: '60a7d9d5a7d5d0001a7d5d00',
    fund_account: '1234567890',
    broker: BROKER.xtp,
    status: FUND_ACCOUNT_STATUS.TRADING,
  };
};

describe('FundAccountController', () => {
  let controller: FundAccountController;
  let response: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundAccountController],
      providers: [
        {
          provide: FundAccountService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockFundAccount()]),
            create: jest.fn().mockResolvedValue(mockFundAccount()),
            count: jest.fn().mockResolvedValue(1),
            update: jest.fn().mockResolvedValue(mockFundAccount()),
            delete: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(mockFundAccount()),
          },
        },
      ],
    }).compile();

    response = { set: jest.fn(() => ({ json: jest.fn() })) };
    controller = module.get<FundAccountController>(FundAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a fundAccount', async () => {
      const toBeCreated = mockFundAccount();

      const fundAccount = await controller.create(toBeCreated);
      expect(fundAccount).toBeDefined();
      expect(fundAccount).toMatchObject(toBeCreated);
    });
  });

  describe('list', () => {
    it('should list all fundAccounts', async () => {
      const fundAccounts = await controller.list({} as any, response);
      expect(fundAccounts).toBeDefined();
      expect(fundAccounts).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a fundAccount', async () => {
      const toBeUpdated = mockFundAccount();
      const updated = await controller.update(toBeUpdated.id, toBeUpdated);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(toBeUpdated);
    });
  });

  describe('delete', () => {
    it('should delete a fundAccount', async () => {
      const toBeDeleted = mockFundAccount();
      const deleted = await controller.delete(toBeDeleted.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get a fundAccount', async () => {
      const toBeGotten = mockFundAccount();
      const gotten = await controller.get(toBeGotten.id);
      expect(gotten).toBeDefined();
      expect(gotten).toMatchObject(toBeGotten);
    });
  });
});
