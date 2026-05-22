import { PrismaClient, type Prisma } from '@prisma/client';

const brokers: Prisma.BrokerCreateInput[] = [
  {
    name: '中泰证券',
    key: 'xtp',
  },
  {
    name: '国泰君安',
    key: 'guojun',
  },
  {
    name: '国信证券',
    key: 'guoxin',
  },
  {
    name: '中金财富',
    key: 'zhongjin',
  },
  {
    name: '中信证券',
    key: 'zhongxin',
  },
  {
    name: '中金EQ',
    key: 'zhongjin_eq',
  },
  {
    name: '方正证券',
    key: 'fangzheng',
  },
  {
    name: '招商证券DMA',
    key: 'zhaoshang_dma',
  },
  {
    name: '安信证券',
    key: 'anxin',
  },
];

export async function seedBrokers(client: PrismaClient) {
  // await client.broker.upser({
  //   data: brokers,
  // });

  for (const broker of brokers) {
    await client.broker.upsert({
      where: {
        key: broker.key,
      },
      create: broker,
      update: broker,
    });
  }

  console.log('seed brokers success');
}
