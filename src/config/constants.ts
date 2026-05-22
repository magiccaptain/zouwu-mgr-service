import { Market } from '@prisma/client';

export const VIRTUAL_DEVICE_UPDATE = 'virtualDevice.update';

export const MarketCode = {
  [Market.SH]: 2,
  [Market.SZ]: 1,
};
