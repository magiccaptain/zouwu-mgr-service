import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

import { settings } from 'src/config';

const DEFAULT_CUSTOM_REPORT_SCHEMA = 'customer_reporting';
const FUND_ACCOUNT_STATEMENT_PERFORMANCE_VIEW =
  '"FundAccountStatementPerformance"';

export interface CustomerReportStatementPerformanceRecord {
  fund_account: string;
  trade_dt: string;
  total_asset: number | string | null;
  turnover: number | string | null;
  daily_ret: number | string | null;
  daily_excess_ret: number | string | null;
  weekly_ret: number | string | null;
  weekly_excess_ret: number | string | null;
  [key: string]: unknown;
}

@Injectable()
export class CustomerReportService implements OnModuleDestroy {
  private readonly logger = new Logger(CustomerReportService.name);

  private pool?: Pool;

  private schema = DEFAULT_CUSTOM_REPORT_SCHEMA;

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.end();
    this.pool = undefined;
  }

  async getFundAccountStatementPerformanceByTradeDate(
    tradeDate: string
  ): Promise<CustomerReportStatementPerformanceRecord[]> {
    this.assertTradeDate(tradeDate);

    const queryResult =
      await this.getPool().query<CustomerReportStatementPerformanceRecord>(
        `
        SELECT *
        FROM ${this.getQualifiedStatementPerformanceView()}
        WHERE trade_dt = $1::date
      `,
        [tradeDate]
      );

    this.logger.log(
      `Loaded ${
        queryResult.rowCount ?? 0
      } customer report rows for ${tradeDate}`
    );

    return queryResult.rows;
  }

  private getPool(): Pool {
    if (this.pool) {
      return this.pool;
    }

    const { connectionString, schema } = this.resolveDatabaseConfig();

    this.schema = schema;
    this.pool = this.createPool(connectionString);

    return this.pool;
  }

  protected createPool(connectionString: string): Pool {
    return new Pool({ connectionString });
  }

  private resolveDatabaseConfig(): {
    connectionString: string;
    schema: string;
  } {
    const customReportUrl = settings.database.custom_report_url;

    if (!customReportUrl) {
      throw new Error('DATABASE_CUSTOM_REPORT_URL is not set');
    }

    const parsedUrl = new URL(customReportUrl);
    const schema =
      parsedUrl.searchParams.get('schema') || DEFAULT_CUSTOM_REPORT_SCHEMA;

    parsedUrl.searchParams.delete('schema');

    return {
      connectionString: parsedUrl.toString(),
      schema,
    };
  }

  private getQualifiedStatementPerformanceView(): string {
    return `${this.escapeIdentifier(
      this.schema
    )}.${FUND_ACCOUNT_STATEMENT_PERFORMANCE_VIEW}`;
  }

  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  private assertTradeDate(tradeDate: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tradeDate)) {
      throw new Error(`Invalid tradeDate: ${tradeDate}`);
    }
  }
}
