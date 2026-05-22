import fs from 'fs';
import path from 'path';

import { PrismaPg } from '@prisma/adapter-pg';
import { Market, PrismaClient, TradeApiType } from '@prisma/client';

type IniData = Record<string, string>;

const DEFAULT_CONFIG_DIR = path.join(process.cwd(), 'data', 'trd_configs');

function parseIni(filePath: string): IniData {
  const content = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const result: IniData = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      continue;
    }

    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim();

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

function parseRequiredInt(value: string | undefined, fieldName: string, filePath: string) {
  if (value === undefined || value === '') {
    throw new Error(`${filePath}: missing required field ${fieldName}`);
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${filePath}: invalid integer for ${fieldName}: ${value}`);
  }

  return parsed;
}

function parseOptionalInt(value: string | undefined) {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`invalid integer value: ${value}`);
  }

  return parsed;
}

function detectMarket(fileName: string): Market {
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes('.sh.')) {
    return Market.SH;
  }

  if (lowerName.includes('.sz.')) {
    return Market.SZ;
  }

  throw new Error(`cannot detect market from file name: ${fileName}`);
}

function resolveMarketFromIni(value: string | undefined, filePath: string): Market | undefined {
  if (!value) {
    return undefined;
  }

  switch (value) {
    case '1':
      return Market.SZ;
    case '2':
      return Market.SH;
    default:
      throw new Error(`${filePath}: unsupported market value ${value}`);
  }
}

function buildATPConfig(fundAccount: string, market: Market, data: IniData, filePath: string) {
  return {
    fund_account: fundAccount,
    market,
    ip: data.ip,
    port: parseRequiredInt(data.port, 'port', filePath),
    spare_ip: data.spare_ip || null,
    spare_port: parseOptionalInt(data.spare_port),
    user: data.user,
    password: data.password,
    branch_id: data.branch_id,
    cust_id: data.cust_id,
    cust_password: data.cust_password,
    sh_account_id: data.sh_account_id,
    sz_account_id: data.sz_account_id,
    client_name: data.client_name,
    client_version: data.client_version,
    client_feature_code: data.client_feature_code,
    account_mode: parseRequiredInt(data.account_mode, 'account_mode', filePath),
    login_mode: parseRequiredInt(data.login_mode, 'login_mode', filePath),
    order_way: data.order_way,
    reconnect_time: parseOptionalInt(data.reconnect_time),
    heartbeat_interval_milli: parseOptionalInt(data.heartbeat_interval_milli),
    connect_timeout_milli: parseOptionalInt(data.connect_timeout_milli),
    rsa_public_key_path: data.rsa_public_key_path || null,
    encrypt_password_lib_path: data.encrypt_password_lib_path || null,
  };
}

function buildXTPConfig(fundAccount: string, market: Market, data: IniData, filePath: string) {
  if (!data.account_key) {
    throw new Error(`${filePath}: missing required field account_key for XTPConfig`);
  }

  return {
    fund_account: fundAccount,
    market,
    ip: data.ip,
    port: parseRequiredInt(data.port, 'port', filePath),
    user: data.user,
    password: data.password,
    local_ip: data.local_ip ?? '',
    log_level: parseOptionalInt(data.log_level) ?? 4,
    account_key: data.account_key,
    save_file_path: data.save_file_path ?? '.',
    software_version: data.software_version ?? '0.0.1',
    heat_beat_interval: parseOptionalInt(data.heat_beat_interval) ?? 3,
  };
}

async function main() {
  const fundAccount = process.argv[2];
  const configDir = process.argv[3] ?? DEFAULT_CONFIG_DIR;

  if (!fundAccount) {
    throw new Error('Usage: pnpm import:td-config -- <fund_account> [config_dir]');
  }

  if (!fs.existsSync(configDir)) {
    throw new Error(`config dir not found: ${configDir}`);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const fundAccountRecord = await prisma.fundAccount.findUnique({
      where: {
        account: fundAccount,
      },
      select: {
        account: true,
        type: true,
        tradeApiType: true,
      },
    });

    if (!fundAccountRecord) {
      throw new Error(`fund account not found: ${fundAccount}`);
    }

    if (fundAccountRecord.type !== 'STOCK') {
      throw new Error(
        `fund account ${fundAccount} is ${fundAccountRecord.type}, only STOCK accounts are supported`
      );
    }

    let tradeApiType = fundAccountRecord.tradeApiType;

    if (!tradeApiType) {
      const [xtpCount, atpCount] = await Promise.all([
        prisma.xTPConfig.count({
          where: {
            fund_account: fundAccount,
          },
        }),
        prisma.aTPConfig.count({
          where: {
            fund_account: fundAccount,
          },
        }),
      ]);

      if (xtpCount > 0 && atpCount === 0) {
        tradeApiType = TradeApiType.XTP;
      } else if (atpCount > 0 && xtpCount === 0) {
        tradeApiType = TradeApiType.ATP;
      } else {
        throw new Error(
          `tradeApiType is not set for ${fundAccount} and cannot infer it from existing configs`
        );
      }
    }

    if (tradeApiType !== TradeApiType.XTP && tradeApiType !== TradeApiType.ATP) {
      throw new Error(`unsupported tradeApiType for ${fundAccount}: ${tradeApiType}`);
    }

    const configFiles = fs
      .readdirSync(configDir)
      .filter((fileName) => fileName.startsWith(`${fundAccount}.`) && fileName.endsWith('.ini'))
      .map((fileName) => path.join(configDir, fileName))
      .sort();

    if (configFiles.length === 0) {
      throw new Error(`no config files found for ${fundAccount} in ${configDir}`);
    }

    await prisma.$transaction(async (tx) => {
      if (tradeApiType === TradeApiType.XTP) {
        await tx.xTPConfig.deleteMany({
          where: {
            fund_account: fundAccount,
          },
        });

        await tx.aTPConfig.deleteMany({
          where: {
            fund_account: fundAccount,
          },
        });

        for (const filePath of configFiles) {
          const fileName = path.basename(filePath);
          const market = detectMarket(fileName);
          const parsed = parseIni(filePath);
          const iniMarket = resolveMarketFromIni(parsed.market, filePath);

          if (iniMarket && iniMarket !== market) {
            throw new Error(
              `${filePath}: market in file (${iniMarket}) does not match file name (${market})`
            );
          }

          const payload = buildXTPConfig(fundAccount, market, parsed, filePath);

          await tx.xTPConfig.upsert({
            where: {
              fund_account_market: {
                fund_account: fundAccount,
                market,
              },
            },
            create: payload,
            update: payload,
          });
        }
      } else {
        await tx.aTPConfig.deleteMany({
          where: {
            fund_account: fundAccount,
          },
        });

        await tx.xTPConfig.deleteMany({
          where: {
            fund_account: fundAccount,
          },
        });

        for (const filePath of configFiles) {
          const fileName = path.basename(filePath);
          const market = detectMarket(fileName);
          const parsed = parseIni(filePath);
          const iniMarket = resolveMarketFromIni(parsed.market, filePath);

          if (iniMarket && iniMarket !== market) {
            throw new Error(
              `${filePath}: market in file (${iniMarket}) does not match file name (${market})`
            );
          }

          const payload = buildATPConfig(fundAccount, market, parsed, filePath);

          await tx.aTPConfig.upsert({
            where: {
              fund_account_market: {
                fund_account: fundAccount,
                market,
              },
            },
            create: payload,
            update: payload,
          });
        }
      }
    });

    console.log(`imported ${configFiles.length} config file(s) for ${fundAccount} as ${tradeApiType}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});