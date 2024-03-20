const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');

const { FundAccountService } = require('../dist/fund_account');
const { ProductService } = require('../dist/product');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const productService = app.get(ProductService);
  const fundAccountService = app.get(FundAccountService);

  const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

  for (const product of products) {
    const { name, type, accounts = [] } = product;

    const p = await productService.create({
      name,
      type,
    });

    for (const account of accounts) {
      await fundAccountService.create({
        fund_account: account.fund_account,
        broker: account.broker,
        product: p.id,
        status: account.status,
      });
    }
  }

  app.close();
}

main();
