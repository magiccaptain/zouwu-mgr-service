import { OpsTaskType } from '@prisma/client';

import { FeishuService } from 'src/feishu/feishu.service';
import { FundAccountService } from 'src/fund_account';
import { HostServerService } from 'src/host_server/host_server.service';
import { MarketValueService } from 'src/market-value/market-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuoteService } from 'src/quote/quote.service';
import { RemoteCommandService } from 'src/remote-command';
import { TradeDataSyncService } from 'src/trade-data-sync/trade-data-sync.service';
import { TradingCalendarService } from 'src/trading-calendar/trading-calendar.service';
import { ValCalcService } from 'src/val-calc/val-calc.service';
import { WarningService } from 'src/warning/warning.service';

import { OpsTaskService } from './ops-task.service';

describe('OpsTaskService', () => {
  let service: OpsTaskService;
  let prismaService: {
    hostServer: { findMany: jest.Mock };
    opsTask: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };
  let feishuService: { notifyMaintenance: jest.Mock };
  let tradingCalendarService: { sync: jest.Mock; isTradingDay: jest.Mock };
  let tradeDataSyncService: { run: jest.Mock };

  beforeEach(() => {
    prismaService = {
      hostServer: { findMany: jest.fn() },
      opsTask: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    feishuService = { notifyMaintenance: jest.fn() };
    tradingCalendarService = { sync: jest.fn(), isTradingDay: jest.fn() };
    tradeDataSyncService = { run: jest.fn() };
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
      tradingCalendarService as unknown as TradingCalendarService,
      tradeDataSyncService as unknown as TradeDataSyncService
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
      tradingCalendarService as unknown as TradingCalendarService,
      { run: jest.fn() } as unknown as TradeDataSyncService
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

describe('trade data sync crons', () => {
  let service: OpsTaskService;
  let prisma: { opsTask: { create: jest.Mock } };
  let feishuService: { notifyMaintenance: jest.Mock };
  let tradingCalendarService: { isTradingDay: jest.Mock };
  let tradeDataSyncService: { run: jest.Mock };

  beforeEach(() => {
    prisma = { opsTask: { create: jest.fn() } };
    feishuService = { notifyMaintenance: jest.fn() };
    tradingCalendarService = { isTradingDay: jest.fn() };
    tradeDataSyncService = { run: jest.fn() };
    service = new OpsTaskService(
      prisma as unknown as PrismaService,
      {} as unknown as RemoteCommandService,
      {} as unknown as HostServerService,
      {} as unknown as FundAccountService,
      {} as unknown as WarningService,
      {} as unknown as QuoteService,
      {} as unknown as MarketValueService,
      {} as unknown as ValCalcService,
      feishuService as unknown as FeishuService,
      tradingCalendarService as unknown as TradingCalendarService,
      tradeDataSyncService as unknown as TradeDataSyncService
    );
  });

  it('skips before-fund sync on non-trading day', async () => {
    tradingCalendarService.isTradingDay.mockResolvedValue(false);
    await service.startBeforeSyncFundAccountTask();
    expect(tradeDataSyncService.run).not.toHaveBeenCalled();
  });

  it('creates BEFORE_SYNC_FUND_ACCOUNT task and runs TradeDataSyncService on trading day', async () => {
    tradingCalendarService.isTradingDay.mockResolvedValue(true);
    prisma.opsTask.create.mockResolvedValue({
      id: 9,
      trade_day: '2026-08-17',
      type: 'BEFORE_SYNC_FUND_ACCOUNT',
    });
    await service.startBeforeSyncFundAccountTask();
    expect(tradeDataSyncService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
        opsTaskId: 9,
        tradeDay: '2026-08-17',
      })
    );
    expect(feishuService.notifyMaintenance).not.toHaveBeenCalled();
  });

  it('creates AFTER_SYNC_FUND_ACCOUNT task and runs TradeDataSyncService on trading day', async () => {
    tradingCalendarService.isTradingDay.mockResolvedValue(true);
    prisma.opsTask.create.mockResolvedValue({
      id: 11,
      trade_day: '2026-08-17',
      type: 'AFTER_SYNC_FUND_ACCOUNT',
    });
    await service.startAfterSyncFundAccountTask();
    expect(tradeDataSyncService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: OpsTaskType.AFTER_SYNC_FUND_ACCOUNT,
        opsTaskId: 11,
        tradeDay: '2026-08-17',
      })
    );
    expect(feishuService.notifyMaintenance).not.toHaveBeenCalled();
  });

  it('15:15 runs AFTER_SYNC_TRADE_DATA only', async () => {
    tradingCalendarService.isTradingDay.mockResolvedValue(true);
    prisma.opsTask.create.mockResolvedValue({ id: 3, trade_day: '2026-08-17' });
    await service.startAfterSyncTradeDataTask();
    expect(tradeDataSyncService.run).toHaveBeenCalledWith(
      expect.objectContaining({ taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA })
    );
  });

  it('does not expose old position/order/trade cron methods', () => {
    expect(service['startAfterSyncPositionTask']).toBeUndefined();
    expect(service['startAfterSyncOrderTask']).toBeUndefined();
    expect(service['startAfterSyncTradeTask']).toBeUndefined();
  });
});
