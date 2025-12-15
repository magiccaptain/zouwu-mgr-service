import { PrismaClient, StrategyLevel, type Prisma } from '@prisma/client';

const fund_accounts_data: Prisma.FundAccountCreateManyInput[] = [];

const product_data: Prisma.ProductCreateManyInput[] = [];

const strategyConstantData: Prisma.StrategyConstantCreateManyInput[] = [];

export async function seedFundAccounts(prisma: PrismaClient) {
  // 创建策略常量
  for (const strategyConstant of strategyConstantData) {
    await prisma.strategyConstant.upsert({
      where: {
        level_standardized_val: {
          level: strategyConstant.level,
          standardized: strategyConstant.standardized,
          val: strategyConstant.val,
        },
      },
      create: strategyConstant,
      update: strategyConstant,
    });
  }
  console.log('strategy constant seed done');

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
