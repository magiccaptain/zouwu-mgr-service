import path from 'path';

import { Market, OpsTaskType } from '@prisma/client';

import { TradeDataFileKind } from './trade-data-sync.types';

export function toCompactTradeDay(tradeDay: string): string {
  return tradeDay.replace(/-/g, '');
}

export function localTradeDataFile(params: {
  tradeDataDir: string;
  brokerKey: string;
  account: string;
  tradeDay: string;
  kind: TradeDataFileKind;
  market: Market;
  taskType?: OpsTaskType;
}): string {
  const { tradeDataDir, brokerKey, account, tradeDay, kind, market, taskType } =
    params;
  if (kind === 'fund' && !taskType) {
    throw new Error('fund snapshot path requires taskType');
  }
  const fileName =
    kind === 'fund'
      ? `${kind}.${taskType}.${market}.json`
      : `${kind}.${market}.json`;
  return path.join(
    tradeDataDir,
    brokerKey,
    account,
    toCompactTradeDay(tradeDay),
    fileName
  );
}
