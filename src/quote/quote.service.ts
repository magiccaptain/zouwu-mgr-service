import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Market } from '@prisma/client';
import csv from 'csvtojson';
import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';

import { settings } from 'src/config/settings';
import { HostServerService } from 'src/host_server/host_server.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandService } from 'src/remote-command';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService,
    private readonly remoteCommandService: RemoteCommandService
  ) {}

  async queryIndexWeight(tradeDay: string = dayjs().format('YYYYMMDD')) {
    const host_server_port =
      settings.quote_index_weight_source.host_server_port;
    const remote_root_dir = settings.quote_index_weight_source.remote_dir;
    const local_root_dir = path.join(
      settings.quote_index_weight_source.local_dir,
      tradeDay
    );

    const hostServer = await this.prismaService.hostServer.findFirst({
      where: {
        ssh_port: host_server_port,
      },
    });

    if (!hostServer) {
      throw new NotFoundException('Host server not found');
    }

    const remote_dir = path.join(remote_root_dir, tradeDay);

    const download_files = [
      'hs300.csv',
      'gz2000.csv',
      'zz500.csv',
      'zz1000.csv',
      'zz2000.csv',
    ];

    fs.mkdirSync(local_root_dir, { recursive: true });

    for (const file of download_files) {
      const remote_file = path.join(remote_dir, file);
      const local_file = path.join(local_root_dir, file);
      await this.hostServerService.pullRemoteFile(
        hostServer,
        remote_file,
        local_file
      );
    }

    const local_files = fs
      .readdirSync(local_root_dir)
      .filter((f) => f.endsWith('.csv'));

    // 收集所有需要处理的数据
    const allIndexWeightData = [];

    for (const file of download_files) {
      if (!local_files.includes(file)) {
        this.logger.error(`${file} not found in local_files`);
        continue;
      }

      const data = fs.readFileSync(path.join(local_root_dir, file), 'utf-8');
      // 去掉第一行
      const lines = data.split('\n').slice(1).filter(Boolean);

      for (const line of lines) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [index, code, symbol, trade_dt, i_weight, updatetime] =
          line.split(',');

        allIndexWeightData.push({
          date: dayjs(trade_dt, 'YYYYMMDD').toDate(),
          code: code,
          symbol: symbol,
          trade_dt: dayjs(trade_dt, 'YYYYMMDD HH:mm:ss.SSS').format(
            'YYYY-MM-DD'
          ),
          i_weight: Number(i_weight),
          updatetime: dayjs(updatetime, 'YYYYMMDDHHmmss').toDate(),
        });
      }
    }

    // 批量处理数据
    if (allIndexWeightData.length > 0) {
      this.logger.log(
        `开始批量处理 ${allIndexWeightData.length} 条指数权重数据`
      );

      // 使用事务进行批量操作
      await this.prismaService.$transaction(async (prisma) => {
        // 分批处理，每批1000条记录
        const batchSize = 1000;
        for (let i = 0; i < allIndexWeightData.length; i += batchSize) {
          const batch = allIndexWeightData.slice(i, i + batchSize);

          // 先删除可能存在的记录
          const tradeDts = [...new Set(batch.map((item) => item.trade_dt))];
          const codes = [...new Set(batch.map((item) => item.code))];
          const symbols = [...new Set(batch.map((item) => item.symbol))];

          await prisma.indexWeight.deleteMany({
            where: {
              trade_dt: { in: tradeDts },
              code: { in: codes },
              symbol: { in: symbols },
            },
          });

          // 批量插入新记录
          await prisma.indexWeight.createMany({
            data: batch,
            skipDuplicates: true,
          });
        }
      });

      this.logger.log(
        `批量处理完成，共处理 ${allIndexWeightData.length} 条记录`
      );
    }
  }

  async queryQuote(tradeDay: string = dayjs().format('YYYYMMDD')) {
    const host_server_port = settings.quote_brief_source.host_server_port;
    const remote_quote_dir = settings.quote_brief_source.remote_dir;
    const local_quote_dir = settings.quote_brief_source.local_dir;

    const hostServer = await this.prismaService.hostServer.findFirst({
      where: {
        ssh_port: host_server_port,
      },
    });

    if (!hostServer) {
      throw new NotFoundException('Host server not found');
    }

    const remote_dir = path.join(remote_quote_dir, dayjs().format('YYYYMMDD'));
    const remote_base_info_file = path.join(remote_dir, 'baseinfo.txt');
    const last_price_file = path.join(remote_dir, 'last_price.txt');

    const local_dir = path.join(
      local_quote_dir,
      hostServer.ssh_port.toString(),
      tradeDay
    );

    await mkdir(local_dir, { recursive: true });
    const local_base_info_file = path.join(local_dir, 'baseinfo.txt');
    const local_last_price_file = path.join(local_dir, 'last_price.txt');

    await this.hostServerService.pullRemoteFile(
      hostServer,
      remote_base_info_file,
      local_base_info_file
    );
    await this.hostServerService.pullRemoteFile(
      hostServer,
      last_price_file,
      local_last_price_file
    );

    type BaseInfo = {
      date: string;
      market: string;
      ticker: string;
      pre_close_price: string;
      upper_limit_price: string;
      lower_limit_price: string;
      security_type: string;
    };

    const base_info = (await csv().fromFile(
      local_base_info_file
    )) as BaseInfo[];

    this.logger.log(`Base info pulled, count: ${base_info.length}`);

    // 由于文件没有header，这里自定义header: date, wind_code, price
    type LastPrice = {
      date: string;
      wind_code: string;
      close_price: string;
    };
    const last_price = (await csv({
      noheader: true,
      headers: ['date', 'wind_code', 'close_price'],
    }).fromFile(local_last_price_file)) as LastPrice[];

    this.logger.log(`Last price pulled, count: ${last_price.length}`);

    const last_price_map = new Map<string, number>();
    for (const p of last_price) {
      last_price_map.set(
        p.wind_code,
        new Decimal(p.close_price).div(10000).toNumber()
      );
    }

    for (const p of base_info) {
      const {
        market,
        ticker,
        date,
        pre_close_price,
        upper_limit_price,
        lower_limit_price,
        security_type,
      } = p;

      let marketStr = '';
      let marketEnum: Market;
      if (market === '1') {
        marketStr = 'SH';
        marketEnum = Market.SH;
      } else if (market === '2') {
        marketStr = 'SZ';
        marketEnum = Market.SZ;
      } else {
        this.logger.error(`Base info ${p.ticker} Invalid market: ${market}`);
      }
      const wind_code = `${ticker}.${marketStr}`;

      let last_price = last_price_map.get(wind_code);

      if (!last_price) {
        this.logger.debug(`Last price not found for ${wind_code}`);
        last_price = 0;
      }

      await this.prismaService.quoteBrief.upsert({
        where: {
          tradeDay_ticker_market: {
            tradeDay: dayjs(date, 'YYYYMMDD').format('YYYY-MM-DD'),
            ticker: ticker,
            market: marketEnum,
          },
        },
        create: {
          tradeDay: dayjs(date, 'YYYYMMDD').format('YYYY-MM-DD'),
          ticker: ticker,
          market: marketEnum,
          pre_close_price: Number(pre_close_price),
          close_price: last_price,
          upper_limit_price: Number(upper_limit_price),
          lower_limit_price: Number(lower_limit_price),
          security_type: Number(security_type),
        },
        update: {
          tradeDay: dayjs(date, 'YYYYMMDD').format('YYYY-MM-DD'),
          ticker: ticker,
          market: marketEnum,
          pre_close_price: Number(pre_close_price),
          close_price: last_price,
          upper_limit_price: Number(upper_limit_price),
          lower_limit_price: Number(lower_limit_price),
          security_type: Number(security_type),
        },
      });
    }

    this.logger.log(`QuoteBrief upserted, count: ${base_info.length}`);
  }
}
