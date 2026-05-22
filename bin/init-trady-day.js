const { NestFactory } = require('@nestjs/core');

const { AppModule } = require('../dist/app.module');
const { TradeDayService } = require('../dist/trade-day');

const dayjs = require('dayjs');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const tradeDayService = app.get(TradeDayService);

  const year = 2024;
  const holidays = [
    '20240101', // 元旦
    '20240210', // 春节
    '20240211',
    '20240212',
    '20240213',
    '20240214',
    '20240215',
    '20240216',
    '20240217',
    '20240404', // 清明
    '20240405',
    '20240406',
    '20240501', // 五一
    '20240502',
    '20240503',
    '20240504',
    '20240505',
    '20240610', // 端午
    '20240915', // 中秋
    '20240916',
    '20240917',
    '20241001', // 十一
    '20241002',
    '20241003',
    '20241004',
    '20241005',
    '20241006',
    '20241007',
  ];

  // 循环整年日期，排除周末, 和节假日
  const start = dayjs(`${year}-01-01`);
  const end = dayjs(`${year}-12-31`);

  let current = start;
  while (current <= end) {
    // 排除周末
    if (current.day() !== 0 && current.day() !== 6) {
      const day = current.format('YYYYMMDD');
      // 排除节假日
      if (!holidays.includes(day)) {
        await tradeDayService.create({
          date: day,
        });
      }
    }
    current = current.add(1, 'day');
  }

  app.close();
}

main();
