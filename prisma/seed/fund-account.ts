import { PrismaClient, type Prisma } from '@prisma/client';

const fund_accounts_data: Prisma.FundAccountCreateManyInput[] = [
  {
    brokerKey: 'xtp',
    account: '109277002626',
    productKey: 'zh1',
    branch: '江苏',
  },
  {
    brokerKey: 'xtp',
    account: '109277002421',
    productKey: 'zy11',
    branch: '江苏',
  },
  {
    brokerKey: 'xtp',
    account: '109277002766',
    productKey: 'xx12',
  },
  {
    brokerKey: 'xtp',
    account: '109289001865',
    productKey: 'zw1',
    branch: '北分',
  },
  {
    brokerKey: 'xtp',
    account: '109289001863',
    productKey: 'zw2',
    branch: '北分',
    active: false,
  },
  {
    brokerKey: 'xtp',
    account: '109180006960',
    productKey: 'zw2',
  },
  {
    brokerKey: 'xtp',
    account: '109180006832',
    productKey: 'xx12',
  },
  {
    brokerKey: 'xtp',
    account: '106110007069',
    productKey: 'zx1',
  },
  {
    brokerKey: 'zhongxin',
    account: '101800002107',
    productKey: 'zh1',
    branch: '浙分',
  },
  {
    brokerKey: 'zhongxin',
    account: '21800009262',
    productKey: 'zy10',
    branch: '恒丰',
  },
  {
    brokerKey: 'zhongxin',
    account: '21800009261',
    productKey: 'xx11',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0311040018566660',
    productKey: 'zh7',
    branch: '北分',
  },
  {
    brokerKey: 'guojun',
    account: '0311040018568066',
    productKey: 'zy3',
    branch: '北分',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0311040018568065',
    productKey: 'zy11',
    branch: '北分',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0333010018328888',
    productKey: 'zy1',
    branch: '杭分',
  },
  {
    brokerKey: 'guojun',
    account: '0344080218196888',
    productKey: 'zh4',
    branch: '深分',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0343010010883355',
    productKey: 'zy11',
    branch: '长沙',
  },
  {
    brokerKey: 'guojun',
    account: '0331050001895125',
    productKey: 'zh2',
    branch: '大渡河',
    active: false,
  },
  {
    brokerKey: 'anxin',
    account: '10000074022',
    productKey: 'zy1',
    active: false,
  },
  {
    brokerKey: 'anxin',
    account: '10000074047',
    productKey: 'xx4',
    active: false,
  },
  {
    brokerKey: 'guoxin',
    account: '330200062400',
    productKey: 'zh2',
    branch: '杭分',
  },
  {
    brokerKey: 'guoxin',
    account: '330200062401',
    productKey: 'zh3',
    branch: '杭分',
  },
  {
    brokerKey: 'guoxin',
    account: '330200063628',
    productKey: 'zh7',
    branch: '杭分',
  },
  {
    brokerKey: 'guoxin',
    account: '330200063539',
    productKey: 'zh8',
    active: false,
  },
  {
    brokerKey: 'guoxin',
    account: '330200063150',
    productKey: 'xx11',
    active: false,
  },
  {
    brokerKey: 'guoxin',
    account: '190000613731',
    productKey: 'zh2',
    branch: '深分',
  },
  {
    brokerKey: 'guoxin',
    account: '190000616455',
    productKey: 'xx4',
    branch: '深分',
  },
  {
    brokerKey: 'guoxin',
    account: '420000234031',
    productKey: 'zh8',
    active: false,
  },
  {
    brokerKey: 'zhongjin',
    account: '6687802443',
    productKey: 'zh4',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803026',
    productKey: 'zh7',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803588',
    productKey: 'xx12',
  },
  {
    brokerKey: 'zhongjin',
    account: '8250001541',
    productKey: 'zy1',
    active: false,
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803668',
    productKey: 'xx2',
  },
  {
    brokerKey: 'zhongjin_eq',
    account: '802500026620',
    productKey: 'zx1',
    active: false,
  },
  {
    brokerKey: 'zhongjin_eq',
    account: '802500026883',
    productKey: 'zy10',
    active: false,
  },
];

const product_data: Prisma.ProductCreateManyInput[] = [
  {
    key: 'zh1',
    name: '致邃投资-智慧矩阵指数增强量化1号私募证券投资基金',
    short_name: '智慧矩阵1号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zh2',
    name: '致邃投资-智慧矩阵指数增强量化2号私募证券投资基金',
    short_name: '智慧矩阵2号',
    companyKey: 'zhisui',
    type: 'gz2000e',
  },
  {
    key: 'zh3',
    name: '致邃投资-智慧矩阵雷欧提斯量化3号私募证券投资基金',
    short_name: '智慧矩阵3号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zh4',
    name: '致邃投资-智慧矩阵奥利维拉量化4号私募证券投资基金',
    short_name: '智慧矩阵4号',
    companyKey: 'zhisui',
    type: 'zz1000n',
  },
  {
    key: 'zh7',
    name: '致邃投资-智慧矩阵指数增强量化7号私募证券投资基金',
    short_name: '智慧矩阵7号',
    companyKey: 'zhisui',
    type: 'gz2000n',
  },
  {
    key: 'zy10',
    name: '致邃投资-致盈10号私募证券投资基金',
    short_name: '致盈10号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zy11',
    name: '致邃投资-致盈11号私募证券投资基金',
    short_name: '致盈11号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zy3',
    name: '致邃投资-致盈3号私募证券投资基金',
    short_name: '致盈3号',
    companyKey: 'zhisui',
    type: 'cta',
  },
  {
    key: 'zh8',
    name: '致邃投资-智慧矩阵量化8号私募证券投资基金',
    short_name: '智慧矩阵8号',
    companyKey: 'zhisui',
    type: 'cta',
  },
  {
    key: 'xx2',
    name: '致邃投资-雪香中性量化二号私募证券投资基金',
    short_name: '雪香二号',
    companyKey: 'zhisui',
    type: 'gz2000e',
  },
  {
    key: 'xx4',
    name: '致邃投资-雪香4号量化对冲私募证券投资基金',
    short_name: '雪香4号',
    companyKey: 'zhisui',
    type: 'gz2000n',
  },
  {
    key: 'xx12',
    name: '致邃投资-雪香金懿对冲量化12号私募证券投资基金',
    short_name: '雪香12号',
    companyKey: 'zhisui',
    type: 'zz2000e',
  },
  {
    key: 'xx11',
    name: '致邃投资-雪香金懿对冲量化11号私募证券投资基金',
    short_name: '雪香11号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zyue3',
    name: '致邃投资-致悦3号私募证券投资基金',
    short_name: '致悦3号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zx1',
    name: '致邃投资-致轩1号私募证券投资基金',
    short_name: '致轩1号',
    companyKey: 'zhisui',
    type: 'zz500e',
  },
  {
    key: 'zw1',
    name: '驺吾长留山1000指数增强1号私募证券投资基金',
    short_name: '长留山1000增强1号',
    companyKey: 'zouwu',
    type: 'gz2000e',
  },
  {
    key: 'zw2',
    name: '驺吾长留山1000指数增强2号私募证券投资基金',
    short_name: '长留山1000增强2号',
    type: 'zz1000e',
    companyKey: 'zouwu',
  },
  {
    key: 'zy1',
    name: '致邃投资-致盈1号私募证券投资基金',
    short_name: '致盈1号',
    type: 'zz500e',
    companyKey: 'zhisui',
  },
];

export async function seedFundAccounts(prisma: PrismaClient) {
  // 创建产品
  await prisma.product.createMany({
    data: product_data,
  });

  console.log('product seed done');

  // 创建基金账户
  await prisma.fundAccount.createMany({
    data: fund_accounts_data,
  });

  console.log('fund account seed done');
}
