// 同步成交数据

import { OpsTaskType, TradeDataType } from '@prisma/client';

import {
  parseSyncTradeDataArgs,
  runTradeDataSyncCli,
} from '../src/trade-data-sync/trade-data-sync.cli';

async function main() {
  const parsed = parseSyncTradeDataArgs(process.argv.slice(2));
  parsed.taskType = OpsTaskType.AFTER_SYNC_TRADE_DATA;
  parsed.dataTypes = [TradeDataType.TRADE];
  await runTradeDataSyncCli(parsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
