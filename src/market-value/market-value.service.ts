import { Injectable, Logger } from '@nestjs/common';
import { FundAccount, Market, QuoteBrief } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MarketValueService {
  private readonly logger = new Logger(MarketValueService.name);
  // key: wind_code
  private readonly quoteBriefMap = new Map<string, QuoteBrief>();

  constructor(private readonly prismaService: PrismaService) {}

  async getQuoteBrief(ticker: string, market: Market, tradeDay: string) {
    const marketStr = market === Market.SH ? 'SH' : 'SZ';
    const wind_code = `${ticker}.${marketStr}`;

    if (this.quoteBriefMap.has(wind_code)) {
      return this.quoteBriefMap.get(wind_code);
    }

    const quoteBrief = await this.prismaService.quoteBrief.findFirst({
      where: {
        ticker: ticker,
        market: market,
        tradeDay: tradeDay,
      },
      orderBy: {
        tradeDay: 'desc',
      },
    });

    if (!quoteBrief) {
      return null;
    }

    // 今日结算价为0
    if (quoteBrief.close_price === 0) {
      // 从trade_day开始往前查找，直到找到 pre_close_price 不为0的
      const preClosePrice = await this.prismaService.quoteBrief.findFirst({
        where: {
          ticker: ticker,
          market: market,
          tradeDay: { lt: tradeDay },
          close_price: { not: 0 },
        },
        orderBy: {
          tradeDay: 'desc',
        },
      });

      if (preClosePrice) {
        this.logger.debug(
          `QuoteBrief close_price is 0, ticker: ${ticker}, market: ${market}, tradeDay: ${tradeDay}, preClosePrice: ${preClosePrice.close_price}, preClosePrice.tradeDay: ${preClosePrice.tradeDay}`
        );
        this.quoteBriefMap.set(wind_code, preClosePrice);
        return preClosePrice;
      }

      this.quoteBriefMap.set(wind_code, quoteBrief);
      return quoteBrief;
    } else {
      this.quoteBriefMap.set(wind_code, quoteBrief);
      return quoteBrief;
    }
  }

  /**
   * 计算基金账户市值
   * @param fundAccount 基金账户
   * @param tradeDay 计算日期 YYYY-MM-DD
   */
  async calcMarketValue(fundAccount: FundAccount, tradeDay: string) {
    // 查询持仓
    const positions = await this.prismaService.position.findMany({
      where: {
        fundAccount: fundAccount.account,
        tradeDay,
      },
    });

    // 重置缓存
    this.quoteBriefMap.clear();

    for (const position of positions) {
      const quoteBrief = await this.getQuoteBrief(
        position.ticker,
        position.market,
        tradeDay
      );

      if (quoteBrief) {
        let marketValue = 0;
        let close_price = quoteBrief.close_price || 0;
        // 如果收盘价为0，则使用昨收价
        if (close_price == 0) {
          close_price = quoteBrief.pre_close_price || 0;
        }
        marketValue = new Decimal(close_price)
          .mul(position.totalQty)
          .toNumber();

        const upsertDto: Prisma.MarketValueCreateInput = {
          trade_day: tradeDay,
          ticker: position.ticker,
          market: position.market,
          position: position.totalQty,
          value: marketValue,
          close_price: close_price,
          close_price_date: quoteBrief?.tradeDay || '',
          fundAccount: {
            connect: { account: fundAccount.account },
          },
        };

        await this.prismaService.marketValue.upsert({
          where: {
            trade_day_fund_account_ticker_market: {
              trade_day: tradeDay,
              fund_account: fundAccount.account,
              ticker: position.ticker,
              market: position.market,
            },
          },
          update: upsertDto,
          create: upsertDto,
        });
      } else {
        this.logger.warn(
          `QuoteBrief not found, ticker: ${position.ticker}, market: ${position.market}, tradeDay: ${tradeDay}`
        );
      }
    }
  }
}
