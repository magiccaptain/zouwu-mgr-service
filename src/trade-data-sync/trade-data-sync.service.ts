import fs from 'fs';
import path from 'path';

import { Injectable, Optional } from '@nestjs/common';
import {
  FundAccountType,
  InnerFundSnapshotReason,
  Market,
  OpsTaskType,
  TradeDataStepStatus,
  TradeDataType,
} from '@prisma/client';

import { settings } from 'src/config';
import { FeishuService } from 'src/feishu/feishu.service';
import { HostServerService } from 'src/host_server/host_server.service';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommand, RemoteCommandService } from 'src/remote-command';

import { localTradeDataFile } from './trade-data-sync.paths';
import { TradeDataFileKind } from './trade-data-sync.types';
import { TradeDataSyncWriter } from './trade-data-sync.writer';

export type TradeDataSyncRunInput = {
  taskType: OpsTaskType;
  tradeDay: string; // YYYY-MM-DD
  opsTaskId: number;
  force?: boolean;
  fundAccounts?: string[];
  markets?: Market[];
  dataTypes?: TradeDataType[];
};

export type TradeDataSyncRunResult = {
  pullSuccess: number;
  pullFailed: number;
  writeSuccess: number;
  writeFailed: number;
  failedAccounts: string[];
  positionFailedAccounts: string[];
};

type AccountRow = {
  account: string;
  brokerKey: string;
  companyKey: string;
  productKey: string;
  XTPConfig: { market: Market }[];
  ATPConfig: { market: Market }[];
};

type SyncUnit = {
  fundAccount: string;
  market: Market;
  dataType: TradeDataType;
  taskType: OpsTaskType;
  brokerKey: string;
  companyKey: string;
  productKey: string;
  step: any;
};

const WRITE_ORDER: TradeDataType[] = [
  TradeDataType.POSITION,
  TradeDataType.ORDER,
  TradeDataType.TRADE,
];

const KIND_BY_TYPE: Record<TradeDataType, TradeDataFileKind> = {
  [TradeDataType.FUND]: 'fund',
  [TradeDataType.POSITION]: 'position',
  [TradeDataType.ORDER]: 'order',
  [TradeDataType.TRADE]: 'trade',
};

@Injectable()
export class TradeDataSyncService {
  private readonly tradeDataDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hostServerService: HostServerService,
    private readonly remoteCommandService: RemoteCommandService,
    private readonly writer: TradeDataSyncWriter,
    private readonly feishuService: FeishuService,
    @Optional() tradeDataDir?: string
  ) {
    this.tradeDataDir = tradeDataDir ?? settings.trade_data_dir;
  }

  async run(input: TradeDataSyncRunInput): Promise<TradeDataSyncRunResult> {
    const units = await this.loadUnits(input);
    if (input.force) {
      await this.resetMatchingSteps(input);
    }
    await this.ensureSteps(input, units);
    await this.stampOpsTaskId(units, input.opsTaskId);
    await this.pullRound(input, units);
    await this.writeRound(input, units);
    await this.pullRound(input, units);
    await this.writeRound(input, units);
    await this.recordWarnings(input, units);
    const result = this.summarize(units);
    await this.feishuService.notifyMaintenance(
      this.formatSummary(input, result)
    );
    return result;
  }

  private async loadUnits(input: TradeDataSyncRunInput): Promise<SyncUnit[]> {
    const accounts: AccountRow[] = await this.prisma.fundAccount.findMany({
      where: { active: true, type: FundAccountType.STOCK },
      include: { XTPConfig: true, ATPConfig: true },
    });

    const dataTypes = this.resolveDataTypes(input);
    const units: SyncUnit[] = [];

    for (const account of accounts) {
      if (
        input.fundAccounts?.length &&
        !input.fundAccounts.includes(account.account)
      ) {
        continue;
      }
      const markets =
        account.XTPConfig.length > 0
          ? account.XTPConfig.map((c) => c.market)
          : account.ATPConfig.map((c) => c.market);

      for (const market of markets) {
        if (input.markets?.length && !input.markets.includes(market)) {
          continue;
        }
        for (const dataType of dataTypes) {
          units.push({
            fundAccount: account.account,
            market,
            dataType,
            taskType: input.taskType,
            brokerKey: account.brokerKey,
            companyKey: account.companyKey,
            productKey: account.productKey,
            step: null,
          });
        }
      }
    }

    return units;
  }

  private resolveDataTypes(input: TradeDataSyncRunInput): TradeDataType[] {
    let defaults: TradeDataType[] = [];
    if (
      input.taskType === OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT ||
      input.taskType === OpsTaskType.AFTER_SYNC_FUND_ACCOUNT
    ) {
      defaults = [TradeDataType.FUND];
    } else if (input.taskType === OpsTaskType.AFTER_SYNC_TRADE_DATA) {
      defaults = [
        TradeDataType.POSITION,
        TradeDataType.ORDER,
        TradeDataType.TRADE,
      ];
    }
    if (!input.dataTypes?.length) {
      return defaults;
    }
    const wanted = new Set(input.dataTypes);
    const resolved = defaults.filter((d) => wanted.has(d));
    if (resolved.length === 0) {
      throw new Error(
        `无匹配的 dataTypes: taskType=${
          input.taskType
        } requested=${input.dataTypes.join(',')}`
      );
    }
    return resolved;
  }

  private async resetMatchingSteps(input: TradeDataSyncRunInput) {
    const dataTypes = this.resolveDataTypes(input);
    const where: any = {
      trade_day: input.tradeDay,
      taskType: input.taskType,
      dataType: { in: dataTypes },
    };
    if (input.fundAccounts?.length) {
      where.fund_account = { in: input.fundAccounts };
    }
    if (input.markets?.length) {
      where.market = { in: input.markets };
    }
    await this.prisma.tradeDataSyncStep.updateMany({
      where,
      data: {
        pullStatus: TradeDataStepStatus.PENDING,
        writeStatus: TradeDataStepStatus.PENDING,
        pullError: null,
        writeError: null,
      },
    });
  }

  private async ensureSteps(input: TradeDataSyncRunInput, units: SyncUnit[]) {
    for (const unit of units) {
      const unique = {
        trade_day: input.tradeDay,
        taskType: input.taskType,
        fund_account: unit.fundAccount,
        market: unit.market,
        dataType: unit.dataType,
      };
      let step = await this.prisma.tradeDataSyncStep.findUnique({
        where: { trade_day_taskType_fund_account_market_dataType: unique },
      });
      if (!step) {
        step = await this.prisma.tradeDataSyncStep.create({
          data: {
            ...unique,
            pullStatus: TradeDataStepStatus.PENDING,
            writeStatus: TradeDataStepStatus.PENDING,
          },
        });
      }
      unit.step = step;
    }
  }

  private async stampOpsTaskId(units: SyncUnit[], opsTaskId: number) {
    for (const unit of units) {
      unit.step = await this.prisma.tradeDataSyncStep.update({
        where: { id: unit.step.id },
        data: { opsTaskId },
      });
    }
  }

  private needsPull(step: any): boolean {
    if (step.pullStatus !== TradeDataStepStatus.SUCCESS) {
      return true;
    }
    if (!step.localFilePath || !fs.existsSync(step.localFilePath)) {
      return true;
    }
    return false;
  }

  private localPath(unit: SyncUnit, tradeDay: string): string {
    return localTradeDataFile({
      tradeDataDir: this.tradeDataDir,
      brokerKey: unit.brokerKey,
      account: unit.fundAccount,
      tradeDay,
      kind: KIND_BY_TYPE[unit.dataType],
      market: unit.market,
      taskType: unit.taskType,
    });
  }

  private async pullRound(input: TradeDataSyncRunInput, units: SyncUnit[]) {
    const toPull = units.filter((u) => this.needsPull(u.step));
    const commands: RemoteCommand[] = [];
    const unitByCmdId = new Map<number, SyncUnit>();

    for (const unit of toPull) {
      const master = await this.hostServerService.getMasterServer(
        unit.brokerKey,
        unit.market,
        unit.companyKey
      );
      if (!master) {
        await this.markPullFailed(unit, '无 master 服务器');
        continue;
      }
      const cmd = await this.makeQuery(unit, master, input.opsTaskId);
      unitByCmdId.set(cmd.id, unit);
      commands.push(cmd);
    }

    if (commands.length === 0) {
      return;
    }

    let results: RemoteCommand[] = [];
    try {
      results = await this.hostServerService.execByHost(commands);
    } catch (error: any) {
      const message = error?.message ?? String(error);
      for (const unit of toPull) {
        if (this.needsPull(unit.step)) {
          await this.markPullFailed(unit, message);
        }
      }
      return;
    }
    for (const cmd of results) {
      const unit = unitByCmdId.get(cmd.id);
      if (!unit) {
        continue;
      }
      try {
        await this.handlePullResult(unit, cmd, input.tradeDay);
      } catch (error: any) {
        await this.markPullFailed(unit, error?.message ?? String(error));
      }
    }
  }

  private async makeQuery(unit: SyncUnit, hostServer: any, opsTaskId: number) {
    const account = unit.fundAccount;
    const opsTask = { id: opsTaskId } as any;
    switch (unit.dataType) {
      case TradeDataType.FUND:
        return this.remoteCommandService.makeQueryAccount(
          hostServer,
          account,
          opsTask
        );
      case TradeDataType.POSITION:
        return this.remoteCommandService.makeQueryPosition(
          hostServer,
          account,
          opsTask
        );
      case TradeDataType.ORDER:
        return this.remoteCommandService.makeQueryOrder(
          hostServer,
          account,
          opsTask
        );
      case TradeDataType.TRADE:
        return this.remoteCommandService.makeQueryTrade(
          hostServer,
          account,
          opsTask
        );
    }
  }

  private async handlePullResult(
    unit: SyncUnit,
    cmd: RemoteCommand,
    tradeDay: string
  ) {
    if (cmd.code !== 0) {
      throw new Error(
        cmd.stderr || `remote command failed with code ${cmd.code}`
      );
    }

    if (unit.dataType === TradeDataType.FUND) {
      const snapshot = this.remoteCommandService.parseQueryAccountCmd(cmd);
      const localFilePath = this.localPath(unit, tradeDay);
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, JSON.stringify(snapshot));
      await this.markPullSuccess(unit, localFilePath);
      return;
    }

    const data = (cmd.stdout ?? '')
      .split('\n')
      .map((l) => tryParseJSON(l))
      .filter(Boolean);
    const filtered = data.filter((d) => Boolean(d.file_path));
    if (filtered.length === 0) {
      throw new Error('no file_path found');
    }
    const localFilePath = this.localPath(unit, tradeDay);
    fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
    await this.hostServerService.pullRemoteFile(
      cmd.hostServer,
      filtered[0].file_path,
      localFilePath
    );
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`local file missing after pull: ${localFilePath}`);
    }
    await this.markPullSuccess(unit, localFilePath);
  }

  private async markPullSuccess(unit: SyncUnit, localFilePath: string) {
    unit.step = await this.prisma.tradeDataSyncStep.update({
      where: { id: unit.step.id },
      data: {
        pullStatus: TradeDataStepStatus.SUCCESS,
        localFilePath,
        pullError: null,
      },
    });
  }

  private async markPullFailed(unit: SyncUnit, message: string) {
    unit.step = await this.prisma.tradeDataSyncStep.update({
      where: { id: unit.step.id },
      data: {
        pullStatus: TradeDataStepStatus.FAILED,
        pullError: message,
      },
    });
  }

  private async writeRound(input: TradeDataSyncRunInput, units: SyncUnit[]) {
    const toWrite = units.filter((u) => {
      const { step } = u;
      return (
        step.pullStatus === TradeDataStepStatus.SUCCESS &&
        step.localFilePath &&
        fs.existsSync(step.localFilePath) &&
        step.writeStatus !== TradeDataStepStatus.SUCCESS
      );
    });

    toWrite.sort(
      (a, b) =>
        WRITE_ORDER.indexOf(a.dataType) - WRITE_ORDER.indexOf(b.dataType)
    );

    for (const unit of toWrite) {
      try {
        await this.writer.write({
          dataType: unit.dataType,
          tradeDay: input.tradeDay,
          fundAccount: unit.fundAccount,
          market: unit.market,
          brokerKey: unit.brokerKey,
          productKey: unit.productKey,
          companyKey: unit.companyKey,
          localFilePath: unit.step.localFilePath,
          reason: this.fundReason(input.taskType, unit.dataType),
        });
        unit.step = await this.prisma.tradeDataSyncStep.update({
          where: { id: unit.step.id },
          data: {
            writeStatus: TradeDataStepStatus.SUCCESS,
            writeError: null,
          },
        });
      } catch (error: any) {
        unit.step = await this.prisma.tradeDataSyncStep.update({
          where: { id: unit.step.id },
          data: {
            writeStatus: TradeDataStepStatus.FAILED,
            writeError: error?.message ?? String(error),
          },
        });
      }
    }
  }

  private fundReason(
    taskType: OpsTaskType,
    dataType: TradeDataType
  ): InnerFundSnapshotReason | undefined {
    if (dataType !== TradeDataType.FUND) {
      return undefined;
    }
    if (taskType === OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT) {
      return InnerFundSnapshotReason.BEFORE_TRADING_DAY;
    }
    if (taskType === OpsTaskType.AFTER_SYNC_FUND_ACCOUNT) {
      return InnerFundSnapshotReason.AFTER_TRADING_DAY;
    }
    return undefined;
  }

  private async recordWarnings(
    input: TradeDataSyncRunInput,
    units: SyncUnit[]
  ) {
    for (const unit of units) {
      const pullOk = unit.step.pullStatus === TradeDataStepStatus.SUCCESS;
      const writeOk = unit.step.writeStatus === TradeDataStepStatus.SUCCESS;
      if (pullOk && writeOk) {
        continue;
      }
      await this.prisma.opsWarning.create({
        data: {
          trade_day: input.tradeDay,
          opsTaskId: input.opsTaskId,
          fund_account: unit.fundAccount,
          text: `${unit.fundAccount} ${unit.market} ${
            unit.dataType
          } pullError=${unit.step.pullError ?? ''} writeError=${
            unit.step.writeError ?? ''
          }`,
        },
      });
    }
  }

  private formatSummary(
    input: TradeDataSyncRunInput,
    result: TradeDataSyncRunResult
  ): string {
    const failedAccounts = result.failedAccounts.join(', ') || '无';
    const positionFailed = result.positionFailedAccounts.join(', ') || '无';
    return [
      `交易数据同步完成 ${input.tradeDay} ${input.taskType}`,
      `pull 成功 ${result.pullSuccess} 失败 ${result.pullFailed}`,
      `write 成功 ${result.writeSuccess} 失败 ${result.writeFailed}`,
      `失败账户: ${failedAccounts}`,
      `持仓失败: ${positionFailed}`,
    ].join('\n');
  }

  private summarize(units: SyncUnit[]): TradeDataSyncRunResult {
    let pullSuccess = 0;
    let pullFailed = 0;
    let writeSuccess = 0;
    let writeFailed = 0;
    const failedAccounts = new Set<string>();
    const positionFailedAccounts = new Set<string>();

    for (const unit of units) {
      const pullOk = unit.step.pullStatus === TradeDataStepStatus.SUCCESS;
      const writeOk = unit.step.writeStatus === TradeDataStepStatus.SUCCESS;
      if (pullOk) {
        pullSuccess += 1;
      } else {
        pullFailed += 1;
      }
      if (writeOk) {
        writeSuccess += 1;
      } else if (pullOk) {
        writeFailed += 1;
      }
      if (!pullOk || !writeOk) {
        failedAccounts.add(unit.fundAccount);
        if (unit.dataType === TradeDataType.POSITION) {
          positionFailedAccounts.add(unit.fundAccount);
        }
      }
    }

    return {
      pullSuccess,
      pullFailed,
      writeSuccess,
      writeFailed,
      failedAccounts: [...failedAccounts],
      positionFailedAccounts: [...positionFailedAccounts],
    };
  }
}
