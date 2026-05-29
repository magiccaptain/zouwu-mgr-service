import { FeishuService } from 'src/feishu/feishu.service';
import { FundAccountService } from 'src/fund_account';
import { HostServerService } from 'src/host_server/host_server.service';
import { MarketValueService } from 'src/market-value/market-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuoteService } from 'src/quote/quote.service';
import { RemoteCommandService } from 'src/remote-command';
import { TradingCalendarService } from 'src/trading-calendar/trading-calendar.service';
import { ValCalcService } from 'src/val-calc/val-calc.service';
import { WarningService } from 'src/warning/warning.service';

import { OpsTaskService } from './ops-task.service';

describe('OpsTaskService', () => {
  let service: OpsTaskService;
  let prismaService: {
    hostServer: { findMany: jest.Mock };
    opsTask: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  let feishuService: { notifyMaintenance: jest.Mock };
  let tradingCalendarService: { sync: jest.Mock; isTradingDay: jest.Mock };

  beforeEach(() => {
    prismaService = {
      hostServer: { findMany: jest.fn() },
      opsTask: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    feishuService = { notifyMaintenance: jest.fn() };
    tradingCalendarService = { sync: jest.fn(), isTradingDay: jest.fn() };
    service = new OpsTaskService(
      prismaService as unknown as PrismaService,
      {} as unknown as RemoteCommandService,
      {} as unknown as HostServerService,
      {} as unknown as FundAccountService,
      {} as unknown as WarningService,
      {} as unknown as QuoteService,
      {} as unknown as MarketValueService,
      {} as unknown as ValCalcService,
      feishuService as unknown as FeishuService,
      tradingCalendarService as unknown as TradingCalendarService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit('should check disk', async () => {
    await service.startAfterCheckHostServerDiskTask();
  }, 10000);

  xit('should check time', async () => {
    await service.startBeforeCheckTimeTask();
  }, 10000);

  xit('should sync fund accounts', async () => {
    await service.startBeforeSyncFundAccountTask();

    console.log('test done');
  }, 10000);
});

describe('syncNextYearTradingCalendar', () => {
  let service: OpsTaskService;
  let feishuService: { notifyMaintenance: jest.Mock };
  let tradingCalendarService: { sync: jest.Mock };

  beforeEach(() => {
    feishuService = { notifyMaintenance: jest.fn() };
    tradingCalendarService = { sync: jest.fn() };
    service = new OpsTaskService(
      {} as unknown as PrismaService,
      {} as unknown as RemoteCommandService,
      {} as unknown as HostServerService,
      {} as unknown as FundAccountService,
      {} as unknown as WarningService,
      {} as unknown as QuoteService,
      {} as unknown as MarketValueService,
      {} as unknown as ValCalcService,
      feishuService as unknown as FeishuService,
      tradingCalendarService as unknown as TradingCalendarService
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should skip when not Dec 20', async () => {
    jest.useFakeTimers({ now: new Date('2025-06-15T09:00:00') });

    await service.syncNextYearTradingCalendar();

    expect(tradingCalendarService.sync).not.toHaveBeenCalled();
    expect(feishuService.notifyMaintenance).not.toHaveBeenCalled();
  });

  it('should sync and notify on Dec 20 success', async () => {
    jest.useFakeTimers({ now: new Date('2025-12-20T09:00:00') });

    tradingCalendarService.sync.mockResolvedValue({
      total: 365,
      created: 250,
      updated: 10,
    });

    await service.syncNextYearTradingCalendar();

    expect(tradingCalendarService.sync).toHaveBeenCalledWith(2026, 2026);
    expect(feishuService.notifyMaintenance).toHaveBeenCalledWith(
      '交易日历自动同步成功：已更新 2026 年交易日历数据，新增 250 条，更新 10 条'
    );
  });

  it('should notify on Dec 20 failure without crashing', async () => {
    jest.useFakeTimers({ now: new Date('2025-12-20T09:00:00') });

    tradingCalendarService.sync.mockRejectedValue(
      new Error('Python service unavailable')
    );

    await service.syncNextYearTradingCalendar();

    expect(feishuService.notifyMaintenance).toHaveBeenCalledWith(
      '交易日历自动同步失败：Python service unavailable，请在管理页面手动重试'
    );
  });
});
