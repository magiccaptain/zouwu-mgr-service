import { BadRequestException } from '@nestjs/common';

import { FundAccountService } from './fund_account.service';

describe('FundAccountService', () => {
  let service: FundAccountService;

  beforeEach(() => {
    service = new FundAccountService({} as any, {} as any, {} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    ['2026-05-21', '2026-05-22'],
    ['2026-05-22', '2026-05-25'],
    ['2026-05-23', '2026-05-25'],
    ['2026-05-24', '2026-05-25'],
  ])('should return next trading day for %s', (baseDate, expectedDate) => {
    expect(service.getNextTradingDay(baseDate)).toBe(expectedDate);
  });

  it('should reject invalid base date', () => {
    expect(() => service.getNextTradingDay('2026-02-31')).toThrow(
      BadRequestException
    );
  });

  xit('should query fund account from host server', async () => {
    expect(service).toBeDefined();
  });
});
