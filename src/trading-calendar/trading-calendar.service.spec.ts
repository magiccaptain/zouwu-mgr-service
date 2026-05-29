import { Market } from '@prisma/client';

import { TradingCalendarService } from './trading-calendar.service';

describe('TradingCalendarService', () => {
  let service: TradingCalendarService;
  let mockPrisma: any;

  const calendarData: Array<{
    id: number;
    market: Market;
    cal_date: string;
    is_open: boolean;
  }> = [];

  function addRange(start: string, end: string, openDates: Set<string>) {
    const d = new Date(start);
    const e = new Date(end);
    while (d <= e) {
      const ds = d.toISOString().slice(0, 10);
      calendarData.push({
        id: calendarData.length + 1,
        market: Market.SSE,
        cal_date: ds,
        is_open: openDates.has(ds),
      });
      d.setDate(d.getDate() + 1);
    }
  }

  const tradingDays = new Set<string>([
    '2026-01-19',
    '2026-01-20',
    '2026-01-21',
    '2026-01-22',
    '2026-01-23',
    '2026-02-02',
    '2026-02-03',
    '2026-02-04',
    '2026-05-22',
    '2026-05-25',
    '2026-05-26',
    '2026-05-27',
    '2026-05-28',
    '2026-05-29',
    '2025-12-30',
    '2025-12-31',
    '2026-01-02',
  ]);

  addRange('2025-12-29', '2026-01-04', tradingDays);
  addRange('2026-01-19', '2026-02-06', tradingDays);
  addRange('2026-05-20', '2026-05-31', tradingDays);

  beforeEach(() => {
    mockPrisma = {
      tradingCalendar: {
        findUnique: jest.fn(({ where }) => {
          const { market, cal_date } = where.market_cal_date;
          const found = calendarData.find(
            (r) => r.market === market && r.cal_date === cal_date
          );
          return Promise.resolve(found ?? null);
        }),
        findFirst: jest.fn(({ where, orderBy }) => {
          const results = calendarData.filter((r) => {
            if (r.market !== where.market) return false;
            if (where.is_open !== undefined && r.is_open !== where.is_open)
              return false;
            if (where.cal_date?.gt && !(r.cal_date > where.cal_date.gt))
              return false;
            if (where.cal_date?.lt && !(r.cal_date < where.cal_date.lt))
              return false;
            return true;
          });

          if (orderBy?.cal_date === 'asc') {
            results.sort((a, b) => a.cal_date.localeCompare(b.cal_date));
          } else if (orderBy?.cal_date === 'desc') {
            results.sort((a, b) => b.cal_date.localeCompare(a.cal_date));
          }

          return Promise.resolve(results[0] ?? null);
        }),
        findMany: jest.fn(({ where, orderBy }) => {
          const results = calendarData.filter((r) => {
            if (r.market !== where.market) return false;
            if (where.cal_date?.gte && r.cal_date < where.cal_date.gte)
              return false;
            if (where.cal_date?.lte && r.cal_date > where.cal_date.lte)
              return false;
            return true;
          });

          if (orderBy?.cal_date === 'asc') {
            results.sort((a, b) => a.cal_date.localeCompare(b.cal_date));
          }

          return Promise.resolve(results);
        }),
      },
    };

    service = new TradingCalendarService(mockPrisma as any, {} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isTradingDay', () => {
    it('should return true for a normal weekday', async () => {
      expect(await service.isTradingDay('2026-05-22')).toBe(true);
    });

    it('should return false for a weekend', async () => {
      expect(await service.isTradingDay('2026-05-23')).toBe(false);
      expect(await service.isTradingDay('2026-05-24')).toBe(false);
    });

    it('should return false for Spring Festival holidays (2026-01-25 to 2026-01-31)', async () => {
      expect(await service.isTradingDay('2026-01-25')).toBe(false);
      expect(await service.isTradingDay('2026-01-26')).toBe(false);
      expect(await service.isTradingDay('2026-01-27')).toBe(false);
      expect(await service.isTradingDay('2026-01-28')).toBe(false);
      expect(await service.isTradingDay('2026-01-29')).toBe(false);
      expect(await service.isTradingDay('2026-01-30')).toBe(false);
      expect(await service.isTradingDay('2026-01-31')).toBe(false);
    });

    it('should return false for a date not in the calendar', async () => {
      expect(await service.isTradingDay('2030-06-01')).toBe(false);
    });
  });

  describe('getNextTradingDay', () => {
    it('should return next day for a normal trading day', async () => {
      expect(await service.getNextTradingDay('2026-05-22')).toBe('2026-05-25');
    });

    it('should skip weekend', async () => {
      expect(await service.getNextTradingDay('2026-05-23')).toBe('2026-05-25');
    });

    it('should skip Spring Festival holidays', async () => {
      expect(await service.getNextTradingDay('2026-01-23')).toBe('2026-02-02');
    });

    it('should skip consecutive holidays during Spring Festival', async () => {
      expect(await service.getNextTradingDay('2026-01-25')).toBe('2026-02-02');
      expect(await service.getNextTradingDay('2026-01-30')).toBe('2026-02-02');
    });

    it('should return strictly after given date (not inclusive)', async () => {
      expect(await service.getNextTradingDay('2026-05-25')).toBe('2026-05-26');
    });

    it('should handle year boundary', async () => {
      expect(await service.getNextTradingDay('2025-12-31')).toBe('2026-01-02');
    });
  });

  describe('getPreviousTradingDay', () => {
    it('should return previous day for a normal trading day', async () => {
      expect(await service.getPreviousTradingDay('2026-05-25')).toBe(
        '2026-05-22'
      );
    });

    it('should skip weekend going backwards', async () => {
      expect(await service.getPreviousTradingDay('2026-05-24')).toBe(
        '2026-05-22'
      );
    });

    it('should skip Spring Festival holidays going backwards', async () => {
      expect(await service.getPreviousTradingDay('2026-02-02')).toBe(
        '2026-01-23'
      );
    });

    it('should return strictly before given date (not inclusive)', async () => {
      expect(await service.getPreviousTradingDay('2026-05-26')).toBe(
        '2026-05-25'
      );
    });

    it('should handle year boundary', async () => {
      expect(await service.getPreviousTradingDay('2026-01-02')).toBe(
        '2025-12-31'
      );
    });
  });

  describe('getByYear', () => {
    it('should return all calendar entries for a given year', async () => {
      const results = await service.getByYear(2026);
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.cal_date).toMatch(/^2026-/);
        expect(r.market).toBe(Market.SSE);
      }
    });

    it('should return entries ordered by cal_date ascending', async () => {
      const results = await service.getByYear(2026);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].cal_date >= results[i - 1].cal_date).toBe(true);
      }
    });

    it('should return empty array for a year with no data', async () => {
      const results = await service.getByYear(2030);
      expect(results).toEqual([]);
    });
  });
});
