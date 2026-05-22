import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { settings } from 'src/config/settings';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CalcFundAccountPnlRequest {
  fund_account: string;
  trade_day: string;
}
export interface CalcFundAccountPnlData {
  fund_account: string;
  trade_day: string;
  rebalance_return: number;
  rebalance_buy_commission: number;
  rebalance_sell_commission: number;
  rebalance_pnl: number;
  t0_return: number;
  t0_pnl: number;
  t0_buy_commission: number;
  t0_sell_commission: number;
  hold_return: number;
}

export interface CalcFundAccountPnlResponse {
  success: boolean;
  data?: CalcFundAccountPnlData;
  error?: string;
}

@Injectable()
export class ValCalcService {
  private readonly logger = new Logger(ValCalcService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 计算基金账户盈亏
   * @param fundAccount 基金账户
   * @param tradeDay 交易日期
   * @returns 计算结果
   */
  async calcFundAccountPnl(
    fundAccount: string,
    tradeDay: string
  ): Promise<CalcFundAccountPnlResponse> {
    try {
      this.logger.log(`开始计算基金账户 ${fundAccount} 在 ${tradeDay} 的盈亏`);

      const requestBody: CalcFundAccountPnlRequest = {
        fund_account: fundAccount,
        trade_day: tradeDay,
      };

      const response = await axios.post(
        settings.val_calc.endpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data as CalcFundAccountPnlData;
      this.logger.log(`基金账户 ${fundAccount} 在 ${tradeDay} 的盈亏计算完成`);

      // console.log(data);

      // 保存数据到 DailyPnl 表
      await this.saveToDailyPnl(data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error(
        `计算基金账户 ${fundAccount} 在 ${tradeDay} 的盈亏时发生错误:`,
        error
      );

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || '未知';
        const statusText = error.response?.statusText || '未知错误';
        const errorMessage = error.response?.data || error.message;

        this.logger.error(
          `计算基金账户盈亏失败: ${status} ${statusText} - ${errorMessage}`
        );

        return {
          success: false,
          error: `HTTP ${status}: ${statusText}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 保存盈亏数据到 DailyPnl 表
   * @param data 盈亏数据
   */
  private async saveToDailyPnl(data: CalcFundAccountPnlData): Promise<void> {
    try {
      // 查询基金账户信息获取 brokerKey, productKey, companyKey
      const fundAccount = await this.prismaService.fundAccount.findUnique({
        where: { account: data.fund_account },
        select: {
          brokerKey: true,
          productKey: true,
          companyKey: true,
        },
      });

      if (!fundAccount) {
        this.logger.error(`未找到基金账户: ${data.fund_account}`);
        throw new Error(`未找到基金账户: ${data.fund_account}`);
      }

      // 使用 upsert 操作，如果记录已存在则更新，否则创建新记录
      await this.prismaService.dailyPnl.upsert({
        where: {
          trade_day_fund_account: {
            trade_day: data.trade_day,
            fund_account: data.fund_account,
          },
        },
        update: {
          rebalance_return: data.rebalance_return,
          rebalance_pnl: data.rebalance_pnl,
          rebalance_buy_commission: data.rebalance_buy_commission,
          rebalance_sell_commission: data.rebalance_sell_commission,
          t0_return: data.t0_return,
          t0_pnl: data.t0_pnl,
          t0_buy_commission: data.t0_buy_commission,
          t0_sell_commission: data.t0_sell_commission,
          hold_return: data.hold_return,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
        },
        create: {
          trade_day: data.trade_day,
          fund_account: data.fund_account,
          rebalance_return: data.rebalance_return,
          rebalance_pnl: data.rebalance_pnl,
          rebalance_buy_commission: data.rebalance_buy_commission,
          rebalance_sell_commission: data.rebalance_sell_commission,
          t0_return: data.t0_return,
          t0_pnl: data.t0_pnl,
          t0_buy_commission: data.t0_buy_commission,
          t0_sell_commission: data.t0_sell_commission,
          hold_return: data.hold_return,
          brokerKey: fundAccount.brokerKey,
          productKey: fundAccount.productKey,
          companyKey: fundAccount.companyKey,
        },
      });

      this.logger.log(
        `成功保存基金账户 ${data.fund_account} 在 ${data.trade_day} 的盈亏数据到 DailyPnl 表`
      );
    } catch (error) {
      console.log(error);
      this.logger.error(
        `保存基金账户 ${data.fund_account} 在 ${data.trade_day} 的盈亏数据到 DailyPnl 表时发生错误:`,
        error
      );
      throw error;
    }
  }
}
