import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Market, TradingCalendar } from '@prisma/client';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { settings } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradingCalendarService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async findById(id: number): Promise<TradingCalendar | null> {
    return this.prismaService.tradingCalendar.findUnique({
      where: { id },
    });
  }

  async update(id: number, is_open: boolean): Promise<TradingCalendar> {
    return this.prismaService.tradingCalendar.update({
      where: { id },
      data: { is_open },
    });
  }

  async syncFromData(
    data: Array<{ cal_date: string; is_open: number }>
  ): Promise<{ total: number; created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const item of data) {
      const is_open = item.is_open === 1;
      const existing = await this.prismaService.tradingCalendar.findUnique({
        where: {
          market_cal_date: {
            market: Market.SSE,
            cal_date: item.cal_date,
          },
        },
      });

      if (existing) {
        if (existing.is_open !== is_open) {
          await this.prismaService.tradingCalendar.update({
            where: { id: existing.id },
            data: { is_open },
          });
          updated++;
        }
      } else {
        await this.prismaService.tradingCalendar.create({
          data: {
            market: Market.SSE,
            cal_date: item.cal_date,
            is_open,
          },
        });
        created++;
      }
    }

    return { total: data.length, created, updated };
  }

  async sync(
    startYear: number,
    endYear: number
  ): Promise<{ total: number; created: number; updated: number }> {
    const startDate = `${startYear}0101`;
    const endDate = `${endYear}1231`;

    const url = `${settings.python_service.url}/trade-cal?start_date=${startDate}&end_date=${endDate}&exchange=SSE`;

    const response = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error) => {
          throw new ServiceUnavailableException(
            `Python service unavailable: ${error.message}`
          );
        })
      )
    );

    const data = response.data as Array<{ cal_date: string; is_open: number }>;

    return this.syncFromData(data);
  }

  async isTradingDay(date: string): Promise<boolean> {
    const record = await this.prismaService.tradingCalendar.findUnique({
      where: {
        market_cal_date: {
          market: Market.SSE,
          cal_date: date,
        },
      },
    });

    return record?.is_open ?? false;
  }

  async getNextTradingDay(date: string): Promise<string> {
    const record = await this.prismaService.tradingCalendar.findFirst({
      where: {
        market: Market.SSE,
        cal_date: { gt: date },
        is_open: true,
      },
      orderBy: { cal_date: 'asc' },
    });

    if (!record) {
      return dayjs(date).add(1, 'day').format('YYYY-MM-DD');
    }

    return record.cal_date;
  }

  async getPreviousTradingDay(date: string): Promise<string> {
    const record = await this.prismaService.tradingCalendar.findFirst({
      where: {
        market: Market.SSE,
        cal_date: { lt: date },
        is_open: true,
      },
      orderBy: { cal_date: 'desc' },
    });

    if (!record) {
      return dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    }

    return record.cal_date;
  }

  async getByYear(year: number): Promise<TradingCalendar[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    return this.prismaService.tradingCalendar.findMany({
      where: {
        market: Market.SSE,
        cal_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { cal_date: 'asc' },
    });
  }
}
