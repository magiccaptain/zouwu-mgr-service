import { posix } from 'path';

import { StrategyLevel } from '@prisma/client';

import {
  CustomerReportService,
  CustomerReportStatementPerformanceRecord,
} from '../src/customer_report/customer_report.service';
import { EmailAttachmentInput, EmailService } from '../src/email/email.service';
import { MinioService } from '../src/minio/minio.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { FeishuService } from '../src/feishu/feishu.service';
import dayjs from 'dayjs';

interface SendFundAccountStatementsOptions {
  date: string;
  directoryPath: string;
  recipients: string[];
  sendFeishuNotification: boolean;
  dryRun: boolean;
}

const PREVIEW_RECIPIENTS = [
  'magiccaptain510@gmail.com',
  'iwnlgre@outlook.com',
  '2876254887@qq.com',
];

const SEND_OPTIONS: SendFundAccountStatementsOptions = {
  date: '', // 运行时设置
  directoryPath: 'fund-acc-statement',
  recipients: [
    '578975299@qq.com',
    '2876254887@qq.com',
    'qiujieming@cmschina.com.cn',
    'fengchaojie@autobio.com.cn',
    '814972545@qq.com',
    'duanyabab@163.com',
    'magiccaptain510@gmail.com',
    'shujujieshou@tfxcapital.cn', 
    'shujujieshou2@bpryinvest.com',
    'iwnlgre@outlook.com',
    "903088646@qq.com",
    "yixuan.qin@accelecom.com",
    "thomasdu@aliyun.com",
    "chanpindata@126.com",
    "chenwh@xmpfl.com",
    "weiganzhi@htsc.com",
    "zhangminghua@gtht.com",
    "baijinyu@guosen.com.cn",
    "yinyun@hicend.com.cn",
    "weiyi@wncapital.cn",
    "zdkwz1101@gmail.com",
    "caoyu@zeusamc.com"
  ],

  // recipients: [
  //   'magiccaptain510@gmail.com',
  // ],
  sendFeishuNotification: true,
  dryRun: false,
};

const SPECIAL_MESSAGE = '';
// const SPECIAL_MESSAGE = '';

function getTMinus1Workday(date: dayjs.Dayjs): dayjs.Dayjs {
  // 周一发上周五，其余发前一天
  const day = date.day(); // 0=周日, 1=周一, ...
  if (day === 1) {
    return date.subtract(3, 'day'); // 周一
  } else if (day === 0) {
    return date.subtract(2, 'day'); // 周日（理论不会发，但兜底）
  } else {
    return date.subtract(1, 'day');
  }
}
const COLUMN_CONFIG = [
  { key: 'fund_account', label: '资金账户', type: 'text' },
  { key: 'trade_dt', label: '交易日', type: 'date' },
  { key: 'exec_benchmark', label: '对标指数', type: 'text' },
  { key: 'total_asset', label: '净资产', type: 'integer' },
  { key: 'turnover', label: '换手率', type: 'percent' },
  { key: 'daily_ret', label: '日涨跌', type: 'signedPercent' },
  { key: 'daily_excess_ret', label: '日超额', type: 'signedPercent' },
  { key: 'weekly_ret', label: '周涨跌', type: 'signedPercent' },
  { key: 'weekly_excess_ret', label: '周超额', type: 'signedPercent' },
  { key: 'annualized_excess_ret', label: '年化超额', type: 'signedPercent' },
  { key: 'annualized_excess_sharpe_ratio', label: '年化超额夏普', type: 'decimal' },
] as const;

type ColumnKey = (typeof COLUMN_CONFIG)[number]['key'];
type ColumnType = (typeof COLUMN_CONFIG)[number]['type'];


async function main() {
  // 解析参数
  const argv = process.argv.slice(2);
  let dateArg = '';
  let sendFeishuNotificationArg: boolean | undefined;
  let dryRunArg: boolean | undefined;
  for (const arg of argv) {
    if (arg.startsWith('--date=')) {
      dateArg = arg.replace('--date=', '');
    } else if (arg.startsWith('--feishu-notify=')) {
      sendFeishuNotificationArg = parseBooleanArg(
        arg.replace('--feishu-notify=', '')
      );
    } else if (arg === '--no-feishu-notify') {
      sendFeishuNotificationArg = false;
    } else if (arg === '--dry-run') {
      dryRunArg = true;
    } else if (arg === '--prod') {
      dryRunArg = false;
    }
  }
  let today = dayjs();
  let t1 = getTMinus1Workday(today);
  let dateStr = dateArg || t1.format('YYYY-MM-DD');
  // 但如果传了参数，依然要做T-1逻辑
  if (dateArg) {
    const d = dayjs(dateArg);
    if (d.isValid()) {
      dateStr = getTMinus1Workday(d).format('YYYY-MM-DD');
    }
  }
  SEND_OPTIONS.date = dateStr;
  if (typeof sendFeishuNotificationArg === 'boolean') {
    SEND_OPTIONS.sendFeishuNotification = sendFeishuNotificationArg;
  }
  if (typeof dryRunArg === 'boolean') {
    SEND_OPTIONS.dryRun = dryRunArg;
  }
  if (SEND_OPTIONS.dryRun) {
    SEND_OPTIONS.recipients = SEND_OPTIONS.recipients.filter((r) =>
      PREVIEW_RECIPIENTS.includes(r)
    );
    console.log(`[DRY-RUN] 预览模式，仅发送至: ${SEND_OPTIONS.recipients.join(', ')}`);
  } else {
    console.log(`[PROD] 正式发送模式，收件人: ${SEND_OPTIONS.recipients.length} 人`);
  }

  const minioService = new MinioService();
  const emailService = new EmailService(minioService);
  const customerReportService = new CustomerReportService();
  const prismaService = new PrismaService();
  const feishuService = new FeishuService();

  let feishuMsg = '';
  let feishuSuccess = true;
  try {
    const reportRows = await customerReportService.getFundAccountStatementPerformanceByTradeDate(
      SEND_OPTIONS.date
    );
    const benchmarkLabelMap = await loadExecutionBenchmarkLabels(
      prismaService,
      reportRows
    );
    const localizedReportRows = localizeExecutionBenchmarkLabels(
      reportRows,
      benchmarkLabelMap
    );

    const attachments = await loadAttachments(
      minioService,
      SEND_OPTIONS.directoryPath,
      SEND_OPTIONS.date
    );
    const reportHtml = buildStatementPerformanceHtml(
      SEND_OPTIONS.date,
      localizedReportRows
    );
    const reportText = buildStatementPerformanceText(
      SEND_OPTIONS.date,
      localizedReportRows
    );

    const results = await Promise.all(
      SEND_OPTIONS.recipients.map((recipient) =>
        emailService.sendMail({
          to: recipient,
          subject: '致邃投资-账户业绩及对账单更新',
          html: reportHtml,
          text: reportText,
          attachments,
        })
      )
    );

    results.forEach((result, index) => {
      console.log(
        `sent to ${SEND_OPTIONS.recipients[index]}: ${result.messageId || 'no-message-id'
        }`
      );
    });

    feishuMsg = `对账单发送成功${SEND_OPTIONS.dryRun ? ' [DRY-RUN 预览]' : ''}\n日期: ${SEND_OPTIONS.date}\n收件人: ${SEND_OPTIONS.recipients.join(', ')}\n共 ${results.length} 封邮件`;
    console.log(
      `done: ${SEND_OPTIONS.directoryPath}/${SEND_OPTIONS.date
      } -> ${SEND_OPTIONS.recipients.join(', ')}`
    );
  } catch (error) {
    feishuSuccess = false;
    feishuMsg = `对账单发送失败\n日期: ${SEND_OPTIONS.date}\n错误: ${error instanceof Error ? error.message : String(error)}`;
    console.error('发送对账单附件失败:', error);
    process.exitCode = 1;
  } finally {
    if (SEND_OPTIONS.sendFeishuNotification) {
      try {
        await feishuService.notifyMaintenance(feishuMsg, '【对账单】');
      } catch (e) {
        console.error('飞书通知失败', e);
      }
    }
    await customerReportService.onModuleDestroy();
    await prismaService.$disconnect();
    if (!feishuSuccess) process.exit(1);
  }
}

main();

function buildStatementPerformanceHtml(
  date: string,
  rows: CustomerReportStatementPerformanceRecord[]
): string {
  const specialMessageHtml = buildSpecialMessageHtml();

  if (!rows.length) {
    return [
      `<p>${escapeHtml(date)} 的对账单附件已发送，请查收。</p>`,
      specialMessageHtml,
      '<p>当日无可用的业绩报表数据。</p>',
    ]
      .filter(Boolean)
      .join('');
  }

  const headerCells = COLUMN_CONFIG.map(
    (column) =>
      `<th style="border:1px solid #d0d7de;padding:8px 12px;background:#f6f8fa;text-align:left;">${escapeHtml(
        column.label
      )}</th>`
  ).join('');
  const bodyRows = rows
    .map((row) => {
      const cells = COLUMN_CONFIG.map(
        (column) =>
          `<td style="${buildCellStyle(
            column.type,
            row[column.key]
          )}">${formatCellValue(column.key, row[column.key])}</td>`
      ).join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <p>${escapeHtml(date)} 的对账单附件已发送，请查收。</p>
    ${specialMessageHtml}
    <p>以下为 ${escapeHtml(date)} 的业绩报表数据，共 ${rows.length} 条。</p>
    <table style="border-collapse:collapse;border-spacing:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;
}

function buildStatementPerformanceText(
  date: string,
  rows: CustomerReportStatementPerformanceRecord[]
): string {
  const specialMessageText = buildSpecialMessageText();

  if (!rows.length) {
    return [
      `${date} 的对账单附件已发送，请查收。`,
      specialMessageText,
      '当日无可用的业绩报表数据。',
    ]
      .filter(Boolean)
      .join('');
  }

  const previewRows = rows
    .slice(0, 10)
    .map((row) =>
      COLUMN_CONFIG.map(
        (column) =>
          `${column.label}: ${stringifyCellValue(column.key, row[column.key])}`
      ).join(', ')
    )
    .join('\n');

  return [
    `${date} 的对账单附件已发送，请查收。`,
    specialMessageText,
    `以下为业绩报表数据预览（共 ${rows.length} 条）：`,
    previewRows,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildSpecialMessageHtml(): string {
  const message = SPECIAL_MESSAGE.trim();

  if (!message) {
    return '';
  }

  return `<div style="margin:16px 0;padding:14px 16px;border:2px solid #b42318;border-radius:8px;background:#fff1f0;color:#b42318;font-size:16px;font-weight:700;line-height:1.6;">${escapeHtml(
    message
  )}</div>`;
}

function buildSpecialMessageText(): string {
  const message = SPECIAL_MESSAGE.trim();

  if (!message) {
    return '';
  }

  return `【重要通知】${message}`;
}

async function loadAttachments(
  minioService: MinioService,
  directoryPath: string,
  date: string
): Promise<EmailAttachmentInput[]> {
  const prefixPath = buildDirectoryPath(directoryPath, date);
  const directoryObjects = await minioService.listObjects({
    path: prefixPath,
  });

  return Promise.all(
    directoryObjects.map(async (directoryObject) => {
      const minioFile = await minioService.getObjectAsBuffer({
        bucket: directoryObject.bucket,
        objectKey: directoryObject.objectKey,
      });

      return {
        filename: minioFile.filename,
        content: minioFile.content,
        contentType: minioFile.contentType,
      };
    })
  );
}

async function loadExecutionBenchmarkLabels(
  prismaService: PrismaService,
  rows: CustomerReportStatementPerformanceRecord[]
): Promise<Map<string, string>> {
  const benchmarkValues = Array.from(
    new Set(
      rows
        .map((row) => row.exec_benchmark)
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0
        )
    )
  );

  if (!benchmarkValues.length) {
    return new Map();
  }

  const strategyConstants = await prismaService.strategyConstant.findMany({
    where: {
      level: StrategyLevel.FUND_ACCOUNT,
      standardized: 'execution_benchmark',
      val: {
        in: benchmarkValues,
      },
    },
    select: {
      val: true,
      desc: true,
    },
  });

  return new Map(
    strategyConstants.map((strategyConstant) => [
      strategyConstant.val,
      strategyConstant.desc || strategyConstant.val,
    ])
  );
}

function localizeExecutionBenchmarkLabels(
  rows: CustomerReportStatementPerformanceRecord[],
  benchmarkLabelMap: Map<string, string>
): CustomerReportStatementPerformanceRecord[] {
  return rows.map((row) => {
    const benchmark = row.exec_benchmark;

    if (typeof benchmark !== 'string' || benchmark.length === 0) {
      return row;
    }

    return {
      ...row,
      exec_benchmark: benchmarkLabelMap.get(benchmark) || benchmark,
    };
  });
}

function formatLocalDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

function coerceToDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function formatCellValue(key: ColumnKey, value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (key === 'trade_dt') {
    const asDate = coerceToDate(value);

    if (asDate) {
      return escapeHtml(formatLocalDateYmd(asDate));
    }
  }

  const column = COLUMN_CONFIG.find((item) => item.key === key);

  if (value instanceof Date) {
    return escapeHtml(value.toISOString().slice(0, 10));
  }

  if (!column) {
    return escapeHtml(String(value));
  }

  return escapeHtml(formatDisplayValue(column.type, value));
}

function stringifyCellValue(key: ColumnKey, value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (key === 'trade_dt') {
    const asDate = coerceToDate(value);

    if (asDate) {
      return formatLocalDateYmd(asDate);
    }
  }

  const column = COLUMN_CONFIG.find((item) => item.key === key);

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (!column) {
    return String(value);
  }

  return formatDisplayValue(column.type, value);
}

function formatDisplayValue(type: ColumnType, value: unknown): string {
  switch (type) {
    case 'integer':
      return formatInteger(value);
    case 'decimal':
      return formatDecimal(value);
    case 'percent':
    case 'signedPercent':
      return formatPercent(value);
    case 'date':
      return String(value);
    default:
      return String(value);
  }
}

function buildCellStyle(type: ColumnType, value: unknown): string {
  const baseStyle =
    'border:1px solid #d0d7de;padding:8px 12px;white-space:nowrap;';

  if (type !== 'signedPercent') {
    return baseStyle;
  }

  const numericValue = toNumber(value);

  if (numericValue === null || numericValue === 0) {
    return baseStyle;
  }

  return `${baseStyle}color:${numericValue > 0 ? '#d92d20' : '#039855'
    };font-weight:600;`;
}

function formatInteger(value: unknown): string {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return '-';
  }

  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(numericValue));
}

function formatPercent(value: unknown): string {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return '-';
  }

  return `${(numericValue * 100).toFixed(2)}%`;
}

function formatDecimal(value: unknown): string {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return '-';
  }

  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 4,
  }).format(numericValue);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
}

function buildDirectoryPath(directoryPath: string, date: string): string {
  const normalizedDirectoryPath = directoryPath.replace(/^\/+|\/+$/g, '');
  const normalizedDate = date.replace(/^\/+|\/+$/g, '');

  return posix.join(normalizedDirectoryPath, normalizedDate);
}

function parseBooleanArg(value: string): boolean {
  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'y', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no', 'n', 'off'].includes(normalizedValue)) {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
