import { Market, OpsTaskType, TradeDataType } from '@prisma/client';

import {
  inferFundAccountTaskType,
  parseSyncTradeDataArgs,
} from './trade-data-sync.cli';

describe('parseSyncTradeDataArgs', () => {
  it('parses force, accounts, markets, types, and task', () => {
    const parsed = parseSyncTradeDataArgs([
      '--task=AFTER_SYNC_TRADE_DATA',
      '--force',
      '--accounts=A1,A2',
      '--markets=SH',
      '--types=POSITION,TRADE',
    ]);
    expect(parsed).toEqual({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      force: true,
      fundAccounts: ['A1', 'A2'],
      markets: [Market.SH],
      dataTypes: [TradeDataType.POSITION, TradeDataType.TRADE],
    });
  });

  it('defaults force to false and omits unset filters', () => {
    expect(parseSyncTradeDataArgs([])).toEqual({ force: false });
  });

  it('rejects unsupported task types', () => {
    expect(() =>
      parseSyncTradeDataArgs(['--task=AFTER_SYNC_POSITIONS'])
    ).toThrow('Invalid --task=AFTER_SYNC_POSITIONS');
  });

  it('throws on unknown flags', () => {
    expect(() => parseSyncTradeDataArgs(['--account='])).toThrow(
      /unknown|--account=/i
    );
    expect(() => parseSyncTradeDataArgs(['--froce'])).toThrow(
      /unknown|--froce/i
    );
  });
});

describe('inferFundAccountTaskType', () => {
  it('uses BEFORE_SYNC_FUND_ACCOUNT before 10:00', () => {
    expect(inferFundAccountTaskType(9)).toBe(
      OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT
    );
  });

  it('uses AFTER_SYNC_FUND_ACCOUNT from 15:00', () => {
    expect(inferFundAccountTaskType(15)).toBe(
      OpsTaskType.AFTER_SYNC_FUND_ACCOUNT
    );
  });

  it('requires --task in the middle of the day', () => {
    expect(() => inferFundAccountTaskType(12)).toThrow(/--task=/);
  });
});
