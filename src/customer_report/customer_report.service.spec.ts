import { settings } from 'src/config';

import { CustomerReportService } from './customer_report.service';

describe('CustomerReportService', () => {
  let service: CustomerReportService;
  let originalCustomReportUrl: string;
  let mockQuery: jest.Mock;
  let mockEnd: jest.Mock;
  let createPoolSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new CustomerReportService();
    originalCustomReportUrl = settings.database.custom_report_url;
    settings.database.custom_report_url =
      'postgresql://postgres:zhisui123@100.94.145.54:5432/zouwu?schema=customer_reporting';

    mockQuery = jest.fn();
    mockEnd = jest.fn();
    createPoolSpy = jest.spyOn(service as never, 'createPool').mockReturnValue({
      query: mockQuery,
      end: mockEnd,
    } as never);
  });

  afterEach(() => {
    settings.database.custom_report_url = originalCustomReportUrl;
    createPoolSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should query statement performance rows by trade date', async () => {
    mockQuery.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          fund_account: '330200062400',
          trade_dt: '2026-05-11',
          total_asset: '16044970.37',
        },
      ],
    });

    await expect(
      service.getFundAccountStatementPerformanceByTradeDate('2026-05-11')
    ).resolves.toEqual([
      {
        fund_account: '330200062400',
        trade_dt: '2026-05-11',
        total_asset: '16044970.37',
      },
    ]);

    expect(createPoolSpy).toHaveBeenCalledWith(
      'postgresql://postgres:zhisui123@100.94.145.54:5432/zouwu'
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        'FROM "customer_reporting"."FundAccountStatementPerformance"'
      ),
      ['2026-05-11']
    );
  });

  it('should reject invalid trade date format', async () => {
    await expect(
      service.getFundAccountStatementPerformanceByTradeDate('20260511')
    ).rejects.toThrow('Invalid tradeDate: 20260511');
    expect(createPoolSpy).not.toHaveBeenCalled();
  });

  it('should close the pool on module destroy', async () => {
    mockQuery.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await service.getFundAccountStatementPerformanceByTradeDate('2026-05-11');
    await service.onModuleDestroy();

    expect(mockEnd).toHaveBeenCalledTimes(1);
  });
});
