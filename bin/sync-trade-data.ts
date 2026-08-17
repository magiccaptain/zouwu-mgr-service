// 同步交易数据（资金 / 持仓 / 委托 / 成交）
// bun run bin/sync-trade-data.ts --task=AFTER_SYNC_TRADE_DATA --accounts=ACC1 --markets=SH --types=POSITION --force

import {
  parseSyncTradeDataArgs,
  runTradeDataSyncCli,
} from '../src/trade-data-sync/trade-data-sync.cli';

async function main() {
  const parsed = parseSyncTradeDataArgs(process.argv.slice(2));
  await runTradeDataSyncCli(parsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
