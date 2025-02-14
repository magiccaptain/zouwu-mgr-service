import { PrismaClient, type Prisma } from '@prisma/client';

const fund_accounts_data: Prisma.FundAccountCreateManyInput[] = [
  {
    brokerKey: 'xtp',
    account: '106110006463',
    productKey: 'zy10',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'xtp',
    account: '109277002626',
    productKey: 'zh1',
    branch: '江苏',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'xtp',
    account: '109277002421',
    productKey: 'zy11',
    branch: '江苏',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'xtp',
    account: '109277002766',
    productKey: 'xx12',
    companyKey: 'zhisui',
    active: false,
  },
  {
    brokerKey: 'xtp',
    account: '109289001865',
    productKey: 'zw1',
    branch: '北分',
    companyKey: 'zouwu',
  },
  {
    brokerKey: 'xtp',
    account: '109289001863',
    productKey: 'zw2',
    branch: '北分',
    active: false,
    companyKey: 'zouwu',
  },
  {
    brokerKey: 'xtp',
    account: '109180006960',
    productKey: 'zw2',
    companyKey: 'zouwu',
  },
  {
    brokerKey: 'xtp',
    account: '109180006832',
    productKey: 'xx12',
    companyKey: 'zhisui',
    active: false,
  },
  {
    brokerKey: 'xtp',
    account: '106110007069',
    productKey: 'zx1',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'xtp',
    account: '109277002803',
    productKey: 'zh5',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'xtp',
    account: '109233002533',
    productKey: 'zy3',
    companyKey: 'zhisui',
    active: false,
  },
  {
    brokerKey: 'zhongxin',
    account: '101800002107',
    productKey: 'zh1',
    branch: '浙分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongxin',
    account: '21800009262',
    productKey: 'zy10',
    branch: '恒丰',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongxin',
    account: '21800009261',
    productKey: 'xx11',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0311040018566660',
    productKey: 'zh7',
    branch: '北分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0311040018568066',
    productKey: 'zy3',
    branch: '北分',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0311040018568065',
    productKey: 'zy11',
    branch: '北分',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0333010018328888',
    productKey: 'zy1',
    branch: '杭分',
    companyKey: 'zhisui',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0344080218196888',
    productKey: 'zh4',
    branch: '深分',
    companyKey: 'zhisui',
    active: false,
  },
  {
    brokerKey: 'guojun',
    account: '0343010010883355',
    productKey: 'zy11',
    branch: '长沙',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0331050001895125',
    productKey: 'zh2',
    branch: '大渡河',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guojun',
    account: '0331040028136983',
    productKey: 'xx12',
    branch: '上分江苏路',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'anxin',
    account: '10000074022',
    productKey: 'zy1',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'anxin',
    account: '10000074047',
    productKey: 'xx4',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '330200062400',
    productKey: 'zh2',
    branch: '杭分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '330200062401',
    productKey: 'zh3',
    branch: '杭分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '330200063628',
    productKey: 'zh7',
    branch: '杭分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '330200063539',
    productKey: 'zh8',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '330200063150',
    productKey: 'xx11',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '190000613731',
    productKey: 'zh2',
    branch: '深分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '190000616455',
    productKey: 'xx4',
    branch: '深分',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'guoxin',
    account: '420000234031',
    productKey: 'zh8',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687802443',
    productKey: 'zh4',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803026',
    productKey: 'zh7',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803588',
    productKey: 'xx12',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin',
    account: '8250001541',
    productKey: 'zy1',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin',
    account: '6687803668',
    productKey: 'xx2',
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin_eq',
    account: '802500026620',
    productKey: 'zx1',
    active: false,
    companyKey: 'zhisui',
  },
  {
    brokerKey: 'zhongjin_eq',
    account: '802500026883',
    productKey: 'zy10',
    active: false,
    companyKey: 'zhisui',
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
    key: 'zh5',
    name: '致邃投资-智慧矩阵奥利维拉量化5号私募证券投资基金',
    short_name: '智慧矩阵5号',
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
    name: '驺吾长留山国证2000指数增强1号私募证券投资基金',
    short_name: '长留山2000指增1号',
    companyKey: 'zouwu',
    type: 'gz2000e',
  },
  {
    key: 'zw2',
    name: '驺吾长留山1000指数增强1号私募证券投资基金',
    short_name: '长留山1000指增1号',
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
  for (const product of product_data) {
    await prisma.product.upsert({
      where: { key: product.key },
      create: product,
      update: product,
    });
  }

  console.log('product seed done');

  // 创建基金账户
  for (const fund_account of fund_accounts_data) {
    await prisma.fundAccount.upsert({
      where: {
        account: fund_account.account,
      },
      create: fund_account,
      update: fund_account,
    });
  }

  console.log('fund account seed done');
}
