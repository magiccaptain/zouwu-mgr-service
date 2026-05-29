import { BadRequestException } from '@nestjs/common';
import { SubscriptionRedemptionDirection } from '@prisma/client';

import { FundAccountService } from './fund_account.service';

describe('FundAccountService', () => {
  let service: FundAccountService;
  let mockPrisma: any;
  let mockTradingCalendar: any;

  beforeEach(() => {
    mockTradingCalendar = {
      getNextTradingDay: jest.fn().mockResolvedValue('2026-05-25'),
    };
    service = new FundAccountService(
      {} as any,
      {} as any,
      {} as any,
      mockTradingCalendar as any
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    ['2026-05-21', '2026-05-22'],
    ['2026-05-22', '2026-05-25'],
    ['2026-05-23', '2026-05-26'],
    ['2026-05-24', '2026-05-25'],
  ])(
    'should return next trading day for %s',
    async (baseDate, expectedDate) => {
      mockTradingCalendar.getNextTradingDay.mockResolvedValue(expectedDate);
      expect(await service.getNextTradingDay(baseDate)).toBe(expectedDate);
      expect(mockTradingCalendar.getNextTradingDay).toHaveBeenCalledWith(
        baseDate
      );
    }
  );

  it('should reject invalid base date', async () => {
    await expect(service.getNextTradingDay('2026-02-31')).rejects.toThrow(
      BadRequestException
    );
  });

  it('should fall back to weekend-skipping when TradingCalendarService throws', async () => {
    mockTradingCalendar.getNextTradingDay.mockRejectedValue(
      new Error('no data')
    );

    expect(await service.getNextTradingDay('2026-05-22')).toBe('2026-05-25');
    expect(await service.getNextTradingDay('2026-05-21')).toBe('2026-05-22');
  });

  xit('should query fund account from host server', async () => {
    expect(service).toBeDefined();
  });

  describe('createSubscriptionRedemption', () => {
    beforeEach(() => {
      mockPrisma = {
        subscriptionRedemptionRecord: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };
      mockTradingCalendar = {
        getNextTradingDay: jest.fn().mockResolvedValue('2026-05-25'),
      };
      service = new FundAccountService(
        mockPrisma as any,
        {} as any,
        {} as any,
        mockTradingCalendar as any
      );
    });

    it('should auto-calculate position_change_day for REDEMPTION with reduce_day', async () => {
      await service.createSubscriptionRedemption({
        fund_account: 'test-account',
        direction: SubscriptionRedemptionDirection.REDEMPTION,
        amount: 1000,
        reduce_day: '2026-05-22',
      });

      expect(mockTradingCalendar.getNextTradingDay).toHaveBeenCalledWith(
        '2026-05-22'
      );
      expect(
        mockPrisma.subscriptionRedemptionRecord.create
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position_change_day: '2026-05-25',
        }),
      });
    });

    it('should leave position_change_day null for SUBSCRIPTION', async () => {
      await service.createSubscriptionRedemption({
        fund_account: 'test-account',
        direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
        amount: 1000,
      });

      expect(
        mockPrisma.subscriptionRedemptionRecord.create
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position_change_day: null,
        }),
      });
    });
  });

  describe('confirmSubscriptionRedemption', () => {
    beforeEach(() => {
      mockPrisma = {
        subscriptionRedemptionRecord: {
          findUnique: jest.fn(),
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
        $transaction: jest.fn((fn: any) => fn(mockPrisma)),
      };
      mockTradingCalendar = {
        getNextTradingDay: jest.fn().mockResolvedValue('2026-05-25'),
      };
      service = new FundAccountService(
        mockPrisma as any,
        {} as any,
        {} as any,
        mockTradingCalendar as any
      );
    });

    it('should set status CLOSE and calculate position_change_day for SUBSCRIPTION', async () => {
      mockPrisma.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
        id: 1,
        direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
        status: 'OPEN',
      });

      await service.confirmSubscriptionRedemption({
        subscription_redemption_id: 1,
        transfer_date: '2026-05-22',
      });

      expect(mockTradingCalendar.getNextTradingDay).toHaveBeenCalledWith(
        '2026-05-22'
      );
      expect(
        mockPrisma.subscriptionRedemptionRecord.update
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'CLOSE',
          position_change_day: '2026-05-25',
        }),
      });
    });

    it('should set status CLOSE without recalculating position_change_day for REDEMPTION', async () => {
      mockPrisma.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
        id: 1,
        direction: SubscriptionRedemptionDirection.REDEMPTION,
        status: 'OPEN',
      });

      await service.confirmSubscriptionRedemption({
        subscription_redemption_id: 1,
        transfer_date: '2026-05-22',
      });

      expect(
        mockPrisma.subscriptionRedemptionRecord.update
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'CLOSE',
        },
      });
    });

    it('should throw BadRequestException if already CLOSE', async () => {
      mockPrisma.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
        id: 1,
        direction: SubscriptionRedemptionDirection.SUBSCRIPTION,
        status: 'CLOSE',
      });

      await expect(
        service.confirmSubscriptionRedemption({
          subscription_redemption_id: 1,
          transfer_date: '2026-05-22',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSubscriptionRedemption', () => {
    beforeEach(() => {
      mockPrisma = {
        subscriptionRedemptionRecord: {
          findUnique: jest.fn(),
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };
      service = new FundAccountService(
        mockPrisma as any,
        {} as any,
        {} as any,
        mockTradingCalendar as any
      );
    });

    it('should update remark when status is OPEN', async () => {
      mockPrisma.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });

      await service.updateSubscriptionRedemption(1, { remark: 'updated' });

      expect(
        mockPrisma.subscriptionRedemptionRecord.update
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { remark: 'updated' },
      });
    });

    it('should throw BadRequestException when status is CLOSE', async () => {
      mockPrisma.subscriptionRedemptionRecord.findUnique.mockResolvedValue({
        id: 1,
        status: 'CLOSE',
      });

      await expect(
        service.updateSubscriptionRedemption(1, { remark: 'updated' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshFunds', () => {
    it('should return combined balance comparison after refresh', async () => {
      const now = new Date();
      const prismaService = {
        innerFundSnapshot: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce([
              { balance: 30000, createdAt: now },
              { balance: 25000, createdAt: new Date(now.getTime() - 86400000) },
            ])
            .mockResolvedValueOnce([
              { balance: 20000, createdAt: now },
              { balance: 18000, createdAt: new Date(now.getTime() - 86400000) },
            ]),
        },
      } as any;

      const svc = new FundAccountService(
        prismaService,
        {} as any,
        {} as any,
        mockTradingCalendar as any
      );
      jest.spyOn(svc, 'syncFundAccount').mockResolvedValue(undefined as any);

      const result = await svc.refreshFunds('test-account');

      expect(svc.syncFundAccount).toHaveBeenCalledTimes(2);
      expect(result.current_balance).toBe(50000);
      expect(result.previous_balance).toBe(43000);
      expect(result.delta).toBe(7000);
      expect(result.current_updated_at).toBeDefined();
      expect(result.previous_updated_at).toBeDefined();
    });

    it('should handle case with no previous snapshot', async () => {
      const now = new Date();
      const prismaService = {
        innerFundSnapshot: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce([{ balance: 30000, createdAt: now }])
            .mockResolvedValueOnce([]),
        },
      } as any;

      const svc = new FundAccountService(
        prismaService,
        {} as any,
        {} as any,
        mockTradingCalendar as any
      );
      jest.spyOn(svc, 'syncFundAccount').mockResolvedValue(undefined as any);

      const result = await svc.refreshFunds('test-account');

      expect(result.current_balance).toBe(30000);
      expect(result.previous_balance).toBe(0);
      expect(result.delta).toBe(30000);
      expect(result.current_updated_at).toBeDefined();
      expect(result.previous_updated_at).toBeNull();
    });
  });
});
