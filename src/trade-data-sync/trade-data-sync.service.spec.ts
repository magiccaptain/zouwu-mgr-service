import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  FundAccountType,
  InnerFundSnapshotReason,
  Market,
  OpsTaskType,
  TradeDataStepStatus,
  TradeDataType,
} from '@prisma/client';

import { localTradeDataFile } from './trade-data-sync.paths';
import { TradeDataSyncService } from './trade-data-sync.service';

const TRADE_DAY = '2026-08-17';
const ACCOUNT = 'ACC1';
const BROKER = 'citic';
const COMPANY = 'co1';
const PRODUCT = 'prod1';

function stepKey(row: {
  trade_day: string;
  taskType: OpsTaskType;
  fund_account: string;
  market: Market;
  dataType: TradeDataType;
}) {
  return `${row.trade_day}|${row.taskType}|${row.fund_account}|${row.market}|${row.dataType}`;
}

describe('TradeDataSyncService', () => {
  let tmpDir: string;
  let steps: Map<string, any>;
  let nextStepId: number;
  let nextCmdId: number;
  let prisma: any;
  let hostServerService: any;
  let remoteCommandService: any;
  let writer: { write: jest.Mock };
  let feishuService: { notifyMaintenance: jest.Mock };
  let service: TradeDataSyncService;

  const masterServer = {
    id: 10,
    brokerKey: BROKER,
    market: Market.SH,
    companyKey: COMPANY,
  };

  const account = {
    account: ACCOUNT,
    brokerKey: BROKER,
    companyKey: COMPANY,
    productKey: PRODUCT,
    type: FundAccountType.STOCK,
    active: true,
    XTPConfig: [{ market: Market.SH }],
    ATPConfig: [],
  };

  function createService() {
    return new TradeDataSyncService(
      prisma,
      hostServerService,
      remoteCommandService,
      writer as any,
      feishuService as any,
      tmpDir
    );
  }

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tds-sync-'));
    steps = new Map();
    nextStepId = 1;
    nextCmdId = 1;

    prisma = {
      fundAccount: {
        findMany: jest.fn().mockResolvedValue([account]),
      },
      tradeDataSyncStep: {
        findUnique: jest.fn(async ({ where }: any) => {
          const unique = where.trade_day_taskType_fund_account_market_dataType;
          if (!unique) return null;
          return steps.get(stepKey(unique)) ?? null;
        }),
        create: jest.fn(async ({ data }: any) => {
          const row = {
            id: nextStepId++,
            pullStatus: TradeDataStepStatus.PENDING,
            writeStatus: TradeDataStepStatus.PENDING,
            localFilePath: null,
            pullError: null,
            writeError: null,
            ...data,
          };
          steps.set(stepKey(row), row);
          return { ...row };
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const existing = [...steps.values()].find((s) => s.id === where.id);
          Object.assign(existing, data);
          return { ...existing };
        }),
        findMany: jest.fn(async ({ where }: any = {}) => {
          return [...steps.values()].filter((s) => {
            if (where?.trade_day && s.trade_day !== where.trade_day)
              return false;
            if (where?.taskType && s.taskType !== where.taskType) return false;
            if (where?.fund_account && s.fund_account !== where.fund_account)
              return false;
            if (where?.market && s.market !== where.market) return false;
            if (where?.dataType && s.dataType !== where.dataType) return false;
            return true;
          });
        }),
        updateMany: jest.fn(async ({ where, data }: any) => {
          let count = 0;
          for (const row of steps.values()) {
            if (where.trade_day && row.trade_day !== where.trade_day) continue;
            if (where.taskType && row.taskType !== where.taskType) continue;
            if (
              where.fund_account?.in &&
              !where.fund_account.in.includes(row.fund_account)
            )
              continue;
            if (where.market?.in && !where.market.in.includes(row.market))
              continue;
            if (where.dataType?.in && !where.dataType.in.includes(row.dataType))
              continue;
            if (where.fund_account && !where.fund_account.in) {
              if (row.fund_account !== where.fund_account) continue;
            }
            if (where.market && !where.market.in) {
              if (row.market !== where.market) continue;
            }
            if (where.dataType && !where.dataType.in) {
              if (row.dataType !== where.dataType) continue;
            }
            Object.assign(row, data);
            count += 1;
          }
          return { count };
        }),
      },
      opsWarning: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    hostServerService = {
      getMasterServer: jest.fn().mockResolvedValue(masterServer),
      execByHost: jest.fn(async (cmds: any[]) =>
        cmds.map((c) => ({
          ...c,
          code: 0,
          stdout: JSON.stringify({ file_path: `/remote/${c.id}.json` }),
          stderr: '',
        }))
      ),
      pullRemoteFile: jest.fn(
        async (_host: any, _remote: string, local: string) => {
          fs.mkdirSync(path.dirname(local), { recursive: true });
          fs.writeFileSync(local, JSON.stringify([]));
        }
      ),
    };

    remoteCommandService = {
      makeQueryAccount: jest.fn(
        async (hostServer: any, fund_account: string) => ({
          id: nextCmdId++,
          hostServer,
          fund_account,
          type: 'QUERY_ACCOUNT',
        })
      ),
      makeQueryPosition: jest.fn(
        async (hostServer: any, fund_account: string) => ({
          id: nextCmdId++,
          hostServer,
          fund_account,
          type: 'QUERY_POSITION',
        })
      ),
      makeQueryOrder: jest.fn(
        async (hostServer: any, fund_account: string) => ({
          id: nextCmdId++,
          hostServer,
          fund_account,
          type: 'QUERY_ORDER',
        })
      ),
      makeQueryTrade: jest.fn(
        async (hostServer: any, fund_account: string) => ({
          id: nextCmdId++,
          hostServer,
          fund_account,
          type: 'QUERY_TRADE',
        })
      ),
      parseQueryAccountCmd: jest.fn().mockReturnValue({
        balance: 1,
        buying_power: 2,
        frozen: 3,
        market: 2,
        xtp_account: {},
        atp_account: {},
      }),
    };

    writer = { write: jest.fn().mockResolvedValue(undefined) };
    feishuService = {
      notifyMaintenance: jest.fn().mockResolvedValue(undefined),
    };
    service = createService();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates PENDING steps and pulls then writes on first run', async () => {
    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(prisma.tradeDataSyncStep.create).toHaveBeenCalledTimes(3);
    expect(prisma.tradeDataSyncStep.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pullStatus: TradeDataStepStatus.PENDING,
          writeStatus: TradeDataStepStatus.PENDING,
        }),
      })
    );
    expect(hostServerService.execByHost).toHaveBeenCalled();
    expect(writer.write).toHaveBeenCalledTimes(3);
    expect(writer.write.mock.calls.map((c: any[]) => c[0].dataType)).toEqual([
      TradeDataType.POSITION,
      TradeDataType.ORDER,
      TradeDataType.TRADE,
    ]);
    expect(result).toEqual(
      expect.objectContaining({
        pullSuccess: 3,
        pullFailed: 0,
        writeSuccess: 3,
        writeFailed: 0,
      })
    );
    for (const kind of ['position', 'order', 'trade'] as const) {
      const file = localTradeDataFile({
        tradeDataDir: tmpDir,
        brokerKey: BROKER,
        account: ACCOUNT,
        tradeDay: TRADE_DAY,
        kind,
        market: Market.SH,
      });
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it('resumes pull-success write-failed without SSH on second run', async () => {
    writer.write.mockImplementation(async (input: any) => {
      if (input.dataType === TradeDataType.POSITION) {
        throw new Error('write fail');
      }
    });

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(hostServerService.execByHost).toHaveBeenCalled();
    const execCallsAfterFirst = hostServerService.execByHost.mock.calls.length;

    writer.write.mockImplementation(async () => undefined);
    writer.write.mockClear();
    hostServerService.execByHost.mockClear();

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 100,
    });

    expect(hostServerService.execByHost).not.toHaveBeenCalled();
    expect(writer.write).toHaveBeenCalled();
    expect(
      writer.write.mock.calls.some(
        (c: any[]) => c[0].dataType === TradeDataType.POSITION
      )
    ).toBe(true);
    expect(result.writeSuccess).toBe(3);
    expect(execCallsAfterFirst).toBeGreaterThan(0);
  });

  it('re-pulls when pull is SUCCESS but local file is missing', async () => {
    const localFile = localTradeDataFile({
      tradeDataDir: tmpDir,
      brokerKey: BROKER,
      account: ACCOUNT,
      tradeDay: TRADE_DAY,
      kind: 'position',
      market: Market.SH,
    });
    prisma.tradeDataSyncStep.create({
      data: {
        trade_day: TRADE_DAY,
        taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
        fund_account: ACCOUNT,
        market: Market.SH,
        dataType: TradeDataType.POSITION,
        pullStatus: TradeDataStepStatus.SUCCESS,
        writeStatus: TradeDataStepStatus.PENDING,
        localFilePath: localFile,
        pullError: null,
        writeError: null,
      },
    });
    expect(fs.existsSync(localFile)).toBe(false);

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(hostServerService.execByHost).toHaveBeenCalled();
    expect(hostServerService.pullRemoteFile).toHaveBeenCalled();
    expect(fs.existsSync(localFile)).toBe(true);
  });

  it('force resets steps and pulls again', async () => {
    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    const idsBefore = [...steps.values()].map((s) => s.id);
    hostServerService.execByHost.mockClear();
    hostServerService.pullRemoteFile.mockClear();

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 100,
      force: true,
    });

    expect(hostServerService.execByHost).toHaveBeenCalled();
    expect(hostServerService.pullRemoteFile).toHaveBeenCalled();
    expect(prisma.tradeDataSyncStep.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pullStatus: TradeDataStepStatus.PENDING,
          writeStatus: TradeDataStepStatus.PENDING,
          pullError: null,
          writeError: null,
        }),
      })
    );
    const idsAfter = [...steps.values()].map((s) => s.id);
    expect(idsAfter).toEqual(idsBefore);
  });

  it('retries incomplete units once in the same run', async () => {
    let execCalls = 0;
    hostServerService.execByHost.mockImplementation(async (cmds: any[]) => {
      execCalls += 1;
      if (execCalls === 1) {
        return cmds.map((c) => ({
          ...c,
          code: 1,
          stdout: '',
          stderr: 'ssh fail',
        }));
      }
      return cmds.map((c) => ({
        ...c,
        code: 0,
        stdout: JSON.stringify({ file_path: `/remote/${c.id}.json` }),
        stderr: '',
      }));
    });

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(hostServerService.execByHost).toHaveBeenCalledTimes(2);
    expect(result.pullSuccess).toBe(3);
    expect(result.writeSuccess).toBe(3);
  });

  it('filters by fundAccounts, markets, and dataTypes', async () => {
    const acc2 = {
      ...account,
      account: 'ACC2',
      XTPConfig: [{ market: Market.SH }],
    };
    const acc1Both = {
      ...account,
      XTPConfig: [{ market: Market.SH }, { market: Market.SZ }],
    };
    prisma.fundAccount.findMany.mockResolvedValue([acc1Both, acc2]);
    hostServerService.getMasterServer.mockImplementation(
      async (_broker: string, market: Market) => ({
        ...masterServer,
        id: market === Market.SH ? 10 : 11,
        market,
      })
    );

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
      fundAccounts: [ACCOUNT],
      markets: [Market.SH],
      dataTypes: [TradeDataType.POSITION],
    });

    expect(prisma.tradeDataSyncStep.create).toHaveBeenCalledTimes(1);
    expect(prisma.tradeDataSyncStep.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fund_account: ACCOUNT,
          market: Market.SH,
          dataType: TradeDataType.POSITION,
        }),
      })
    );
    expect(writer.write).toHaveBeenCalledTimes(1);
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({
        fundAccount: ACCOUNT,
        market: Market.SH,
        dataType: TradeDataType.POSITION,
      })
    );
  });

  it('does not delete DB rows for a unit whose pull failed', async () => {
    hostServerService.execByHost.mockImplementation(async (cmds: any[]) =>
      cmds.map((c) => ({
        ...c,
        code: 1,
        stdout: '',
        stderr: 'pull failed',
      }))
    );

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(writer.write).not.toHaveBeenCalled();
    expect(steps.size).toBe(3);
    expect(
      [...steps.values()].every(
        (s) => s.pullStatus === TradeDataStepStatus.FAILED
      )
    ).toBe(true);
    expect(prisma.tradeDataSyncStep.create).toHaveBeenCalledTimes(3);
  });

  it('marks pull FAILED when pullRemoteFile swallows SCP and local file is missing', async () => {
    hostServerService.pullRemoteFile.mockImplementation(async () => {
      // SCP swallowed: no local file written
    });

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
      dataTypes: [TradeDataType.POSITION],
    });

    const step = [...steps.values()].find(
      (s) => s.dataType === TradeDataType.POSITION
    );
    expect(step.pullStatus).toBe(TradeDataStepStatus.FAILED);
    expect(step.pullError).toMatch(/local file|missing|not found|不存在|缺失/i);
    expect(step.writeStatus).toBe(TradeDataStepStatus.PENDING);
    expect(writer.write).not.toHaveBeenCalled();
    expect(result.pullSuccess).toBe(0);
    expect(result.pullFailed).toBe(1);
  });

  it('does not count pull-failed units toward writeFailed', async () => {
    hostServerService.execByHost.mockImplementation(async (cmds: any[]) =>
      cmds.map((c) => ({
        ...c,
        code: 1,
        stdout: '',
        stderr: 'ssh pull fail',
      }))
    );

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
      dataTypes: [TradeDataType.POSITION],
    });

    expect(result.pullFailed).toBeGreaterThanOrEqual(1);
    expect(result.writeFailed).toBe(0);
    expect(result.writeSuccess).toBe(0);
    expect(writer.write).not.toHaveBeenCalled();

    const msg = feishuService.notifyMaintenance.mock.calls[0][0] as string;
    expect(msg).toMatch(/pull 成功 0 失败 1/);
    expect(msg).toMatch(/write 成功 0 失败 0/);
  });

  it('writes one OpsWarning per remaining failed unit and one Feishu summary listing position failures', async () => {
    hostServerService.execByHost.mockImplementation(async (cmds: any[]) =>
      cmds.map((c) => {
        if (c.type === 'QUERY_TRADE') {
          return { ...c, code: 0, stdout: 'no-file-path', stderr: '' };
        }
        return {
          ...c,
          code: 0,
          stdout: JSON.stringify({ file_path: `/remote/${c.id}.json` }),
          stderr: '',
        };
      })
    );
    writer.write.mockImplementation(async (input: any) => {
      if (input.dataType === TradeDataType.POSITION) {
        throw new Error('position write boom');
      }
    });

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(prisma.opsWarning.create).toHaveBeenCalledTimes(2);
    expect(prisma.opsWarning.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          trade_day: TRADE_DAY,
          opsTaskId: 99,
          fund_account: ACCOUNT,
          text: expect.stringMatching(/POSITION[\s\S]*position write boom/),
        }),
      })
    );
    expect(prisma.opsWarning.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          trade_day: TRADE_DAY,
          opsTaskId: 99,
          fund_account: ACCOUNT,
          text: expect.stringMatching(/TRADE/),
        }),
      })
    );
    expect(feishuService.notifyMaintenance).toHaveBeenCalledTimes(1);
    const msg = feishuService.notifyMaintenance.mock.calls[0][0] as string;
    expect(msg).toMatch(/ACC1/);
    expect(msg).toMatch(/pull 成功 2 失败 1/);
    expect(msg).toMatch(/write 成功 1 失败 1/);
    expect(msg).toMatch(/持仓失败: ACC1/);
    expect(result.positionFailedAccounts).toEqual([ACCOUNT]);
    expect(result.failedAccounts).toEqual([ACCOUNT]);
  });

  it('force with types=POSITION only resets POSITION steps, not ORDER/TRADE', async () => {
    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    const orderBefore = {
      ...[...steps.values()].find((s) => s.dataType === TradeDataType.ORDER),
    };
    const tradeBefore = {
      ...[...steps.values()].find((s) => s.dataType === TradeDataType.TRADE),
    };

    hostServerService.execByHost.mockClear();
    remoteCommandService.makeQueryPosition.mockClear();
    remoteCommandService.makeQueryOrder.mockClear();
    remoteCommandService.makeQueryTrade.mockClear();
    writer.write.mockClear();
    prisma.tradeDataSyncStep.updateMany.mockClear();

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 100,
      force: true,
      dataTypes: [TradeDataType.POSITION],
    });

    expect(prisma.tradeDataSyncStep.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dataType: { in: [TradeDataType.POSITION] },
        }),
      })
    );
    expect(remoteCommandService.makeQueryPosition).toHaveBeenCalled();
    expect(remoteCommandService.makeQueryOrder).not.toHaveBeenCalled();
    expect(remoteCommandService.makeQueryTrade).not.toHaveBeenCalled();

    const orderAfter = [...steps.values()].find(
      (s) => s.dataType === TradeDataType.ORDER
    );
    const tradeAfter = [...steps.values()].find(
      (s) => s.dataType === TradeDataType.TRADE
    );
    expect(orderAfter.opsTaskId).toBe(orderBefore.opsTaskId);
    expect(tradeAfter.opsTaskId).toBe(tradeBefore.opsTaskId);
    expect(orderAfter.pullStatus).toBe(TradeDataStepStatus.SUCCESS);
    expect(tradeAfter.pullStatus).toBe(TradeDataStepStatus.SUCCESS);
  });

  it('throws when AFTER_SYNC_TRADE_DATA and dataTypes FUND have empty intersection', async () => {
    await expect(
      service.run({
        taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
        tradeDay: TRADE_DAY,
        opsTaskId: 99,
        force: true,
        dataTypes: [TradeDataType.FUND],
      })
    ).rejects.toThrow(/无匹配|empty|intersection|dataTypes/i);

    expect(prisma.tradeDataSyncStep.updateMany).not.toHaveBeenCalled();
    expect(hostServerService.execByHost).not.toHaveBeenCalled();
    expect(writer.write).not.toHaveBeenCalled();
  });

  it('BEFORE_SYNC_FUND_ACCOUNT writes with reason BEFORE_TRADING_DAY', async () => {
    const result = await service.run({
      taskType: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
    });

    expect(remoteCommandService.makeQueryAccount).toHaveBeenCalled();
    expect(remoteCommandService.parseQueryAccountCmd).toHaveBeenCalled();
    expect(hostServerService.pullRemoteFile).not.toHaveBeenCalled();
    expect(writer.write).toHaveBeenCalledTimes(1);
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({
        dataType: TradeDataType.FUND,
        fundAccount: ACCOUNT,
        reason: InnerFundSnapshotReason.BEFORE_TRADING_DAY,
      })
    );
    expect(result.pullSuccess).toBe(1);
    expect(result.writeSuccess).toBe(1);
  });

  it('does not write after-fund JSON as BEFORE_TRADING_DAY when resuming a failed morning write', async () => {
    remoteCommandService.parseQueryAccountCmd.mockReturnValue({
      balance: 10,
      buying_power: 2,
      frozen: 3,
      market: 2,
    });
    writer.write.mockRejectedValue(new Error('morning write fail'));

    await service.run({
      taskType: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
      tradeDay: TRADE_DAY,
      opsTaskId: 1,
    });

    remoteCommandService.parseQueryAccountCmd.mockReturnValue({
      balance: 99,
      buying_power: 2,
      frozen: 3,
      market: 2,
    });
    writer.write.mockResolvedValue(undefined);
    writer.write.mockClear();
    hostServerService.execByHost.mockClear();

    await service.run({
      taskType: OpsTaskType.AFTER_SYNC_FUND_ACCOUNT,
      tradeDay: TRADE_DAY,
      opsTaskId: 2,
    });

    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: InnerFundSnapshotReason.AFTER_TRADING_DAY,
      })
    );
    const afterFile = writer.write.mock.calls[0][0].localFilePath as string;
    expect(JSON.parse(fs.readFileSync(afterFile, 'utf-8')).balance).toBe(99);

    writer.write.mockClear();
    hostServerService.execByHost.mockClear();

    await service.run({
      taskType: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
      tradeDay: TRADE_DAY,
      opsTaskId: 3,
    });

    expect(hostServerService.execByHost).not.toHaveBeenCalled();
    expect(writer.write).toHaveBeenCalledTimes(1);
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: InnerFundSnapshotReason.BEFORE_TRADING_DAY,
      })
    );
    const beforeFile = writer.write.mock.calls[0][0].localFilePath as string;
    expect(beforeFile).not.toBe(afterFile);
    expect(JSON.parse(fs.readFileSync(beforeFile, 'utf-8')).balance).toBe(10);
  });

  it('marks pull FAILED and still sends Feishu when execByHost throws', async () => {
    hostServerService.execByHost.mockRejectedValue(new Error('ssh exploded'));

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
      dataTypes: [TradeDataType.POSITION],
    });

    const step = [...steps.values()].find(
      (s) => s.dataType === TradeDataType.POSITION
    );
    expect(step.pullStatus).toBe(TradeDataStepStatus.FAILED);
    expect(step.pullError).toMatch(/ssh exploded/);
    expect(writer.write).not.toHaveBeenCalled();
    expect(feishuService.notifyMaintenance).toHaveBeenCalled();
    expect(result.pullFailed).toBe(1);
  });

  it('marks pull FAILED and skips write when getMasterServer returns null', async () => {
    hostServerService.getMasterServer.mockResolvedValue(null);

    const result = await service.run({
      taskType: OpsTaskType.AFTER_SYNC_TRADE_DATA,
      tradeDay: TRADE_DAY,
      opsTaskId: 99,
      dataTypes: [TradeDataType.POSITION],
    });

    const step = [...steps.values()].find(
      (s) => s.dataType === TradeDataType.POSITION
    );
    expect(step.pullStatus).toBe(TradeDataStepStatus.FAILED);
    expect(step.pullError).toMatch(/无 master 服务器/);
    expect(writer.write).not.toHaveBeenCalled();
    expect(hostServerService.execByHost).not.toHaveBeenCalled();
    expect(result.pullFailed).toBe(1);
    expect(result.pullSuccess).toBe(0);
  });
});
