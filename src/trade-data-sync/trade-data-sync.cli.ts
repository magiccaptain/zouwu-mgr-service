import { Market, OpsTaskType, TradeDataType } from '@prisma/client';
import dayjs from 'dayjs';

const TASK_NAMES: Partial<Record<OpsTaskType, string>> = {
  [OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT]: '盘前资金账户同步',
  [OpsTaskType.AFTER_SYNC_FUND_ACCOUNT]: '盘后资金账户同步',
  [OpsTaskType.AFTER_SYNC_TRADE_DATA]: '盘后交易数据同步',
};

const ALLOWED_TASK_TYPES = new Set<string>([
  OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
  OpsTaskType.AFTER_SYNC_FUND_ACCOUNT,
  OpsTaskType.AFTER_SYNC_TRADE_DATA,
]);

export type ParsedSyncTradeDataArgs = {
  taskType?: OpsTaskType;
  force: boolean;
  fundAccounts?: string[];
  markets?: Market[];
  dataTypes?: TradeDataType[];
};

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEnum<T extends string>(
  value: string,
  allowed: Record<string, T>,
  flag: string
): T {
  if (!Object.values(allowed).includes(value as T)) {
    throw new Error(`Invalid ${flag}=${value}`);
  }
  return value as T;
}

export function parseSyncTradeDataArgs(
  argv: string[]
): ParsedSyncTradeDataArgs {
  const parsed: ParsedSyncTradeDataArgs = { force: false };

  for (const arg of argv) {
    if (arg === '--force') {
      parsed.force = true;
      continue;
    }
    if (arg.startsWith('--task=')) {
      const value = arg.slice('--task='.length);
      if (!ALLOWED_TASK_TYPES.has(value)) {
        throw new Error(`Invalid --task=${value}`);
      }
      parsed.taskType = value as OpsTaskType;
      continue;
    }
    if (arg.startsWith('--accounts=')) {
      parsed.fundAccounts = splitList(arg.slice('--accounts='.length));
      continue;
    }
    if (arg.startsWith('--markets=')) {
      parsed.markets = splitList(arg.slice('--markets='.length)).map((item) =>
        parseEnum(item, Market, '--markets')
      );
      continue;
    }
    if (arg.startsWith('--types=')) {
      parsed.dataTypes = splitList(arg.slice('--types='.length)).map((item) =>
        parseEnum(item, TradeDataType, '--types')
      );
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return parsed;
}

export function inferFundAccountTaskType(hour: number): OpsTaskType {
  if (hour <= 9) {
    return OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT;
  }
  if (hour >= 15) {
    return OpsTaskType.AFTER_SYNC_FUND_ACCOUNT;
  }
  throw new Error(
    'mid-day fund sync requires --task=BEFORE_SYNC_FUND_ACCOUNT or --task=AFTER_SYNC_FUND_ACCOUNT'
  );
}

export async function runTradeDataSyncCli(
  parsed: ParsedSyncTradeDataArgs
): Promise<void> {
  if (!parsed.taskType) {
    throw new Error(
      '--task is required (BEFORE_SYNC_FUND_ACCOUNT | AFTER_SYNC_FUND_ACCOUNT | AFTER_SYNC_TRADE_DATA)'
    );
  }

  const [{ NestFactory }, { AppModule }] = await Promise.all([
    import('@nestjs/core'),
    import('../app.module'),
  ]);
  const { PrismaService } = await import('../prisma/prisma.service');
  const { TradingCalendarService } = await import(
    '../trading-calendar/trading-calendar.service'
  );
  const { TradeDataSyncService } = await import('./trade-data-sync.service');

  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const prismaService = app.get(PrismaService);
    const tradingCalendarService = app.get(TradingCalendarService);
    const tradeDataSyncService = app.get(TradeDataSyncService);

    const tradeDay = dayjs().format('YYYY-MM-DD');
    const isTradingDay = await tradingCalendarService.isTradingDay(tradeDay);
    if (!isTradingDay) {
      console.log(`非交易日 ${tradeDay}，跳过执行`);
      return;
    }

    const task = await prismaService.opsTask.create({
      data: {
        name: TASK_NAMES[parsed.taskType] ?? parsed.taskType,
        trade_day: tradeDay,
        type: parsed.taskType,
      },
    });

    const result = await tradeDataSyncService.run({
      taskType: parsed.taskType,
      tradeDay: task.trade_day,
      opsTaskId: task.id,
      force: parsed.force,
      fundAccounts: parsed.fundAccounts,
      markets: parsed.markets,
      dataTypes: parsed.dataTypes,
    });

    console.log(`trade data sync ${parsed.taskType} ${tradeDay} done`, result);
  } finally {
    await app.close();
  }
}
