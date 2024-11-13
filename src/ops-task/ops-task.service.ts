import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  InnerFundSnapshotReason,
  OpsTask,
  OpsTaskType,
  OpsWarningType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { flatten, isEmpty, round } from 'lodash';

import { settings } from 'src/config';
import { MarketCode } from 'src/config/constants';
import { FundAccountService, InnerSnapshotFromServer } from 'src/fund_account';
import { HostServerService } from 'src/host_server/host_server.service';
import { tryParseJSON } from 'src/lib/lang/json';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommand, RemoteCommandService } from 'src/remote-command';

@Injectable()
export class OpsTaskService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly remoteCommandService: RemoteCommandService,
    private readonly hostServerService: HostServerService,
    private readonly fundAccountService: FundAccountService
  ) {}

  async checkHostServerDiskTask(task: OpsTask) {
    const hostServers = await this.prismaService.hostServer.findMany({
      where: {
        active: true,
      },
    });

    let commands: RemoteCommand[] = await Promise.all(
      hostServers.map((hostServer) => {
        return this.remoteCommandService.makeCheckDisk(hostServer, task);
      })
    );

    commands = await this.hostServerService.batchExecRemoteCommand(
      commands,
      true
    );

    await Promise.all(
      commands.map(async (cmd) => {
        const { code, stdout, trade_day, opsTaskId, id, hostServer } = cmd;
        const info = tryParseJSON(stdout);

        if (code !== 0 || (code === 0 && !info)) {
          return this.prismaService.opsWarning.create({
            data: {
              type: OpsWarningType.DISK_CHECK_FAILED,
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
              text: `磁盘检查失败`,
            },
          });
        }

        const {
          disk_total,
          disk_free,
          os,
          os_version,
          cpu_model,
          cpu_cores,
          mem_total,
        } = info;
        const disk_percent = (disk_total - disk_free) / disk_total;

        if (disk_percent > settings.warning.disk_usage) {
          await this.prismaService.opsWarning.create({
            data: {
              type: OpsWarningType.DISK_FULL,
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
              text: `磁盘使用率 ${round(disk_percent * 100)}%`,
            },
          });
        }

        return this.prismaService.hostServer.update({
          where: {
            id: hostServer.id,
          },
          data: {
            last_check_at: dayjs().toDate(),
            disk_total,
            disk_used: disk_total - disk_free,
            os,
            os_version,
            cpu_model,
            cpu_cores,
            memory_size: mem_total,
          },
        });
      })
    );
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
          const { brokerKey, account } = fund_account;

          const markets = !isEmpty(fund_account.XTPConfig)
            ? fund_account.XTPConfig.map((c) => c.market)
            : fund_account.ATPConfig.map((c) => c.market);

          const ret: RemoteCommand[] = [];

          for (const market of markets) {
            const masterServer = await this.hostServerService.getMasterServer(
              brokerKey,
              market
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
      true
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

    console.log('盘前资金账户同步完成');
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

    console.log('盘后资金账户同步完成');
    return;
  }
}
