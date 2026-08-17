// 同步 fund account 数据

import dayjs from 'dayjs';

import {
  inferFundAccountTaskType,
  parseSyncTradeDataArgs,
  runTradeDataSyncCli,
} from '../src/trade-data-sync/trade-data-sync.cli';

async function main() {
  const parsed = parseSyncTradeDataArgs(process.argv.slice(2));
  if (!parsed.taskType) {
    parsed.taskType = inferFundAccountTaskType(dayjs().hour());
  }
  await runTradeDataSyncCli(parsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
