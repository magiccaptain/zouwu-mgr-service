import { Market } from '@prisma/client';

export function GetMarketByTicker(ticker: string) {
  if (ticker.startsWith('00')) {
    return Market.SZ;
  }

  if (ticker.startsWith('30')) {
    return Market.SZ;
  }

  if (ticker.startsWith('60')) {
    return Market.SH;
  }

  if (ticker.startsWith('68')) {
    return Market.SH;
  }

  if (ticker.startsWith('51')) {
    return Market.SH;
  }

  if (ticker.startsWith('58')) {
    return Market.SH;
  }

  if (ticker.startsWith('15')) {
    return Market.SZ;
  }
}
