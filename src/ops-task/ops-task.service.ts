import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  InnerFundSnapshotReason,
  OpsTask,
  OpsTaskType,
  OpsWarningStatus,
  OpsWarningType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { flatten, isEmpty } from 'lodash';

import { settings } from 'src/config';
import { MarketCode } from 'src/config/constants';
import { FundAccountService, InnerSnapshotFromServer } from 'src/fund_account';
import { HostServerService } from 'src/host_server/host_server.service';
import { tryParseJSON } from 'src/lib/lang/json';
import { MarketValueService } from 'src/market-value/market-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuoteService } from 'src/quote/quote.service';
import { RemoteCommand, RemoteCommandService } from 'src/remote-command';
import { ValCalcService } from 'src/val-calc/val-calc.service';
import { WarningService } from 'src/warning/warning.service';

@Injectable()
export class OpsTaskService {
  private readonly logger = new Logger(OpsTaskService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly remoteCommandService: RemoteCommandService,
    private readonly hostServerService: HostServerService,
    private readonly fundAccountService: FundAccountService,
    private readonly warningService: WarningService,
    private readonly quoteService: QuoteService,
    private readonly marketValueService: MarketValueService,
    private readonly valCalcService: ValCalcService
  ) {}

  async checkHostServerDiskTask(task: OpsTask) {
    const hostServers = await this.prismaService.hostServer.findMany({
      where: {
        active: true,
      },
    });

    for (const hostServer of hostServers) {
      try {
        await this.hostServerService.checkDisk(hostServer, task);
      } catch (error) {
        this.logger.error(error);
        continue;
      }
    }

    const warnings = await this.prismaService.opsWarning.findMany({
      where: {
        opsTask: {
          id: task.id,
        },
        status: OpsWarningStatus.PENDING,
        type: OpsWarningType.DISK_FULL,
      },
      include: {
        hostServer: true,
        fundAccount: true,
        opsTask: true,
      },
    });

    // 自动处理
    for (const warning of warnings) {
      await this.warningService.handleDiskFullWarning(warning);
    }
  }

  // 每日早8点执行盘前磁盘检查
  @Cron('0 8 * * *')
  async startBeforeCheckHostServerDiskTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘前磁盘检查',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.BEFORE_CHECK_HOST_SERVER_DISK,
      },
    });

    await this.checkHostServerDiskTask(task);
    this.logger.log('盘前磁盘检查完成');
  }

  // 每日下午 15:30 执行盘后磁盘检查
  @Cron('30 15 * * *')
  async startAfterCheckHostServerDiskTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后磁盘检查',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_CHECK_HOST_SERVER_DISK,
      },
    });

    await this.checkHostServerDiskTask(task);
    this.logger.log('盘后磁盘检查完成');
  }

  async startBeforeCheckTimeTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘前时间检查',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.BEFORE_CHECK_HOST_SERVER_TIME,
      },
    });

    const hostServers = await this.prismaService.hostServer.findMany({
      where: {
        active: true,
      },
    });

    let commands = await Promise.all(
      hostServers.map((hostServer) => {
        return this.remoteCommandService.makeCheckTime(hostServer, task);
      })
    );

    commands = await this.hostServerService.batchExecRemoteCommand(
      commands,
      true
    );

    const now = dayjs();

    await Promise.all(
      commands.map(async (cmd) => {
        const { code, stdout, trade_day, opsTaskId, id, hostServer } = cmd;

        if (code !== 0) {
          return this.prismaService.opsWarning.create({
            data: {
              type: OpsWarningType.TIME_CHECK_FAILED,
              trade_day,
              opsTask: {
                connect: {
                  id: opsTaskId,
                },
              },
              hostServer: {
                connect: {
                  id: hostServer.id,
                },
              },
              remoteCommand: {
                connect: {
                  id: id,
                },
              },
              text: `时间检查失败`,
            },
          });
        }

        const serverTime = dayjs(stdout.trim());
        const diff = Math.abs(now.diff(serverTime, 'seconds'));

        if (diff >= settings.warning.time_diff) {
          await this.prismaService.opsWarning.create({
            data: {
              type: OpsWarningType.TIME_ERROR,
              trade_day,
              opsTask: {
                connect: {
                  id: opsTaskId,
                },
              },
              hostServer: {
                connect: {
                  id: hostServer.id,
                },
              },
              remoteCommand: {
                connect: {
                  id: id,
                },
              },
              text: `时间差异 ${diff} 秒`,
            },
          });
        }
      })
    );
  }

  async startSyncFundAccountTask(task: OpsTask) {
    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
      include: {
        XTPConfig: true,
        ATPConfig: true,
      },
    });

    let commands = flatten(
      await Promise.all(
        fundAccounts.map(async (fund_account) => {
          const { brokerKey, account, companyKey } = fund_account;

          const markets = !isEmpty(fund_account.XTPConfig)
            ? fund_account.XTPConfig.map((c) => c.market)
            : fund_account.ATPConfig.map((c) => c.market);

          const ret: RemoteCommand[] = [];

          for (const market of markets) {
            const masterServer = await this.hostServerService.getMasterServer(
              brokerKey,
              market,
              companyKey
            );

            if (!masterServer) {
              console.error(`${brokerKey} ${market} 无 master 服务器`);
            } else {
              const cmd = await this.remoteCommandService.makeQueryAccount(
                masterServer,
                account,
                task
              );

              ret.push(cmd);
            }
          }

          return ret;
        })
      )
    );

    commands = await this.hostServerService.batchExecRemoteCommand(
      commands,
      false
    );

    await Promise.all(
      commands.map(async (cmd) => {
        const {
          code,
          stdout,
          stderr,
          trade_day,
          opsTaskId,
          id,
          hostServer,
          fund_account,
        } = cmd;
        const { market, brokerKey } = hostServer;

        if (code !== 0) {
          console.error(
            `资金账户同步失败 ${brokerKey} ${fund_account} ${market}`,
            stdout,
            stderr
          );

          return await this.prismaService.opsWarning.create({
            data: {
              trade_day,
              opsTask: {
                connect: {
                  id: opsTaskId,
                },
              },
              hostServer: {
                connect: {
                  id: hostServer.id,
                },
              },
              fundAccount: {
                connect: {
                  account: fund_account,
                },
              },
              remoteCommand: {
                connect: {
                  id: id,
                },
              },
              text: `资金账户同步失败`,
            },
          });
        }

        // 保存snapshot
        const data = stdout
          .split('\n')
          .map((l) => tryParseJSON(l))
          .filter(Boolean);

        const snapshot: InnerSnapshotFromServer = data.find(
          (d) => d.market === MarketCode[market]
        );

        if (!snapshot) {
          console.error(
            `资金账户同步失败 ${brokerKey} ${fund_account} ${market}`,
            stdout,
            stderr
          );
          return await this.prismaService.opsWarning.create({
            data: {
              trade_day,
              opsTask: {
                connect: {
                  id: opsTaskId,
                },
              },
              hostServer: {
                connect: {
                  id: hostServer.id,
                },
              },
              fundAccount: {
                connect: {
                  account: fund_account,
                },
              },
              remoteCommand: {
                connect: {
                  id: id,
                },
              },
              text: '资金账户同步失败 未找到数据',
            },
          });
        }

        let reason: InnerFundSnapshotReason = InnerFundSnapshotReason.SYNC;
        const now = dayjs();

        if (now.hour() <= 9) {
          reason = InnerFundSnapshotReason.BEFORE_TRADING_DAY;
        } else if (now.hour() >= 15) {
          reason = InnerFundSnapshotReason.AFTER_TRADING_DAY;
        }

        await this.fundAccountService.saveFundAccountSnapshot(
          market,
          fund_account,
          reason,
          snapshot
        );

        console.log(`资金账户同步成功 ${fund_account} ${market}`);
      })
    );
  }

  // 周一到周五下午15:40 执行计算市值
  @Cron('40 15 * * 1-5')
  async startAfterCalcMarketValueTask() {
    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
    });

    for (const fundAccount of fundAccounts) {
      await this.marketValueService.calcMarketValue(
        fundAccount,
        dayjs().format('YYYY-MM-DD')
      );
      this.logger.log(
        `盘后市值计算完成 ${fundAccount.brokerKey} ${fundAccount.account}`
      );
    }

    await this.prismaService.opsTask.create({
      data: {
        name: '盘后市值计算',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_CALC_MARKET_VALUE,
      },
    });

    this.logger.log('盘后市值计算完成');
  }

  // 周一到周五早上8:40 执行
  @Cron('40 8 * * 1-5')
  async startBeforeSyncFundAccountTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘前资金账户同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.BEFORE_SYNC_FUND_ACCOUNT,
      },
    });

    await this.startSyncFundAccountTask(task);

    this.logger.log('盘前资金账户同步完成');
    return;
  }

  // 周一到周五下午15:5 执行
  @Cron('5 15 * * 1-5')
  async startAfterSyncFundAccountTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后资金账户同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_SYNC_FUND_ACCOUNT,
      },
    });

    await this.startSyncFundAccountTask(task);

    this.logger.log('盘后资金账户同步完成');
    return;
  }

  // 周一到周五下午15:30 执行 同步行情数据
  @Cron('30 15 * * 1-5')
  async startAfterSyncQuoteTask() {
    await this.prismaService.opsTask.create({
      data: {
        name: '盘后行情brief数据同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_SYNC_LAST_PRICE,
      },
    });

    await this.quoteService.queryQuote();

    this.logger.log('盘后行情brief数据同步完成');
    return;
  }

  // 周一到周五下午15:15 执行查询持仓数据
  @Cron('15 15 * * 1-5')
  async startAfterSyncPositionTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后持仓数据同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_SYNC_POSITIONS,
      },
    });

    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
      include: {
        XTPConfig: true,
        ATPConfig: true,
        broker: true,
      },
    });

    for (const fundAccount of fundAccounts) {
      const markets = !isEmpty(fundAccount.XTPConfig)
        ? fundAccount.XTPConfig.map((c) => c.market)
        : fundAccount.ATPConfig.map((c) => c.market);

      for (const market of markets) {
        try {
          await this.fundAccountService.queryPosition(
            fundAccount,
            market,
            task
          );
        } catch (error) {
          this.logger.error(error);
          await this.prismaService.opsWarning.create({
            data: {
              trade_day: dayjs().format('YYYY-MM-DD'),
              opsTask: {
                connect: { id: task.id },
              },
              text: ` FundAccount ${fundAccount.account} market ${market} 持仓数据同步失败 ${error.message}`,
              fundAccount: {
                connect: { id: fundAccount.id },
              },
            },
          });
        }
      }
    }

    this.logger.log('盘后持仓数据同步完成');
    return;
  }

  // 周一到周五下午15:20 执行查询订单数据
  @Cron('20 15 * * 1-5')
  async startAfterSyncOrderTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后订单数据同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_SYNC_ORDER,
      },
    });

    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
      include: {
        XTPConfig: true,
        ATPConfig: true,
      },
    });

    for (const fundAccount of fundAccounts) {
      const markets = !isEmpty(fundAccount.XTPConfig)
        ? fundAccount.XTPConfig.map((c) => c.market)
        : fundAccount.ATPConfig.map((c) => c.market);

      for (const market of markets) {
        try {
          await this.fundAccountService.queryOrder(fundAccount, market, task);
        } catch (error) {
          this.logger.error(error);
          await this.prismaService.opsWarning.create({
            data: {
              trade_day: dayjs().format('YYYY-MM-DD'),
              opsTask: {
                connect: { id: task.id },
              },
              fundAccount: {
                connect: { id: fundAccount.id },
              },
              text: ` FundAccount ${fundAccount.account} market ${market} 订单数据同步失败 ${error.message}`,
            },
          });
        }
      }
    }
    this.logger.log('盘后订单数据同步完成');
    return;
  }

  // 周一到周五下午15:25 执行查询交易数据
  @Cron('30 15 * * 1-5')
  async startAfterSyncTradeTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后交易数据同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_SYNC_TRADE,
      },
    });
    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
      include: {
        XTPConfig: true,
        ATPConfig: true,
      },
    });

    for (const fundAccount of fundAccounts) {
      const markets = !isEmpty(fundAccount.XTPConfig)
        ? fundAccount.XTPConfig.map((c) => c.market)
        : fundAccount.ATPConfig.map((c) => c.market);

      for (const market of markets) {
        try {
          await this.fundAccountService.queryTrade(fundAccount, market, task);
        } catch (error) {
          this.logger.error(error);
          await this.prismaService.opsWarning.create({
            data: {
              trade_day: dayjs().format('YYYY-MM-DD'),
              opsTask: {
                connect: { id: task.id },
              },
              fundAccount: {
                connect: { id: fundAccount.id },
              },
              text: ` FundAccount ${fundAccount.account} market ${market} 交易数据同步失败 ${error.message}`,
            },
          });
        }
      }
    }

    this.logger.log('盘后交易数据同步完成');
    return;
  }

  // 周一到周五下午16:00 执行计算盈亏
  @Cron('0 16 * * 1-5')
  async startAfterCalcPnlTask() {
    await this.prismaService.opsTask.create({
      data: {
        name: '盘后盈亏计算',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_CALC_PNL,
      },
    });
    const fundAccounts = await this.prismaService.fundAccount.findMany({
      where: {
        active: true,
      },
    });
    const tradeDay = dayjs().format('YYYY-MM-DD');

    // await this.valCalcService.cal(task);

    for (const fundAccount of fundAccounts) {
      await this.valCalcService.calcFundAccountPnl(
        fundAccount.account,
        tradeDay
      );
    }

    this.logger.log('盘后盈亏计算完成');
    return;
  }

  // 周一到周五早上8:35 执行
  @Cron('35 8 * * 1-5')
  async startBeforeSyncWeightIndexTask() {
    await this.prismaService.opsTask.create({
      data: {
        name: '盘前权重指数同步',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.BEFORE_SYNC_INDEX_WEIGHT,
      },
    });

    await this.quoteService.queryIndexWeight();

    this.logger.log('盘前权重指数同步完成');
    return;
  }

  // 周一到周五晚上23:30 执行
  @Cron('30 23 * * 1-5')
  async startAfterClearProcessesTask() {
    const task = await this.prismaService.opsTask.create({
      data: {
        name: '盘后进程清理',
        trade_day: dayjs().format('YYYY-MM-DD'),
        type: OpsTaskType.AFTER_CLEAR_PROCESSES,
      },
    });

    const hostServers = await this.prismaService.hostServer.findMany({
      where: {
        active: true,
      },
    });

    for (const hostServer of hostServers) {
      const remoteCommand = await this.remoteCommandService.makePkillTraderTool(
        hostServer,
        task
      );
      await this.hostServerService.execRemoteCommand(remoteCommand);
      this.logger.log(
        `清理 ${hostServer.brokerKey} ${hostServer.ssh_port} 进程完成`
      );
    }

    this.logger.log('盘后进程清理完成');
    return;
  }
}
