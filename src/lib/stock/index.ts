/**
 * 获取市场
 * @param {string} ticker
 */
export function GetMarketByTicker(ticker: string) {
  if (ticker.startsWith('00')) {
    return 'SZ';
  }

  if (ticker.startsWith('30')) {
    return 'SZ';
  }

  if (ticker.startsWith('60')) {
    return 'SH';
  }

  if (ticker.startsWith('68')) {
    return 'SH';
  }
}
