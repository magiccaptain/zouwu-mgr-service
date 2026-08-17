import { InnerFundSnapshotReason, Market, TradeDataType } from '@prisma/client';

export const WRITE_CHUNK_SIZE = 1000;

export type TradeDataFileKind = 'fund' | 'position' | 'order' | 'trade';

export type WriteUnitInput = {
  dataType: TradeDataType;
  tradeDay: string; // YYYY-MM-DD
  fundAccount: string;
  market: Market;
  brokerKey: string;
  productKey: string;
  companyKey: string;
  localFilePath: string;
  reason?: InnerFundSnapshotReason; // FUND 必填
};
