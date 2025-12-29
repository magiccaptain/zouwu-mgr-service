import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import {
  OpsWarningStatus,
  OpsWarningType,
  Prisma,
  ProcessMonitor,
  ProcessStatus,
  ProcessStatusType,
  ProcessType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { NodeSSH } from 'node-ssh';

import { settings } from 'src/config/settings';
import { HostServerService } from 'src/host_server/host_server.service';
import { Cron } from 'src/lib/cron';
import { PrismaService } from 'src/prisma/prisma.service';

interface ProcessInfo {
  pid: number;
  ppid?: number;
  cpu_percent: number;
  memory_percent: number;
  memory_used_mb: number;
  uptime_seconds: number;
  start_time: Date;
  command: string;
}

@Injectable()
export class ProcessMonitorService {
  private readonly logger = new Logger(ProcessMonitorService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly hostServerService: HostServerService
  ) {}

  /**
   * 检查单个进程状态
   */
  async checkProcessStatus(
    processMonitor: ProcessMonitor & {
      hostServer: {
        id: number;
        ssh_host: string;
        ssh_port: number;
        ssh_user: string;
      };
    }
  ): Promise<ProcessStatus> {
    const startTime = Date.now();
    const tradeDay = dayjs().format('YYYY-MM-DD');
    let status: ProcessStatusType = ProcessStatusType.ERROR;
    let pid: number | null = null;
    let ppid: number | null = null;
    let cmd: string | null = null;
    let cpuPercent: number | null = null;
    let memoryPercent: number | null = null;
    let memoryUsedMb: number | null = null;
    let uptimeSeconds: number | null = null;
    let startTimeDate: Date | null = null;
    let errorMessage: string | null = null;

    try {
      // 连接 SSH
      // 需要完整的 HostServer 对象，但这里只有部分字段，需要从数据库获取完整对象
      const fullHostServer = await this.prismaService.hostServer.findUnique({
        where: { id: processMonitor.hostServer.id },
      });

      if (
        !fullHostServer ||
        !fullHostServer.ssh_host ||
        !fullHostServer.ssh_port ||
        !fullHostServer.ssh_user
      ) {
        throw new Error(
          `HostServer ${processMonitor.hostServer.id} SSH configuration is incomplete`
        );
      }

      const ssh = await this.hostServerService.connect(fullHostServer);

      try {
        // 查找进程
        const processInfo = await this.findProcess(ssh, processMonitor);

        if (processInfo) {
          status = ProcessStatusType.RUNNING;
          pid = processInfo.pid;
          ppid = processInfo.ppid;
          cmd = processInfo.command;
          cpuPercent = processInfo.cpu_percent;
          memoryPercent = processInfo.memory_percent;
          memoryUsedMb = processInfo.memory_used_mb;
          uptimeSeconds = processInfo.uptime_seconds;
          startTimeDate = processInfo.start_time;

          // 检查告警阈值
          await this.checkThresholds(
            processMonitor,
            cpuPercent,
            memoryPercent,
            tradeDay
          );
        } else {
          status = ProcessStatusType.NOT_FOUND;
          errorMessage = 'Process not found';
        }
      } finally {
        ssh?.dispose();
      }
    } catch (error) {
      this.logger.error(
        `Failed to check process status for ProcessMonitor ${processMonitor.id}: ${error.message}`,
        error.stack
      );
      status = ProcessStatusType.ERROR;
      errorMessage = error.message;
    }

    const checkDuration = Date.now() - startTime;

    // 创建进程状态记录
    const processStatus = await this.createProcessStatus(
      processMonitor.id,
      tradeDay,
      status,
      pid,
      ppid,
      cmd,
      cpuPercent,
      memoryPercent,
      memoryUsedMb,
      uptimeSeconds,
      startTimeDate,
      checkDuration,
      errorMessage
    );

    // 如果进程未运行或出错，创建警告
    if (
      status === ProcessStatusType.NOT_FOUND ||
      status === ProcessStatusType.ERROR
    ) {
      await this.createProcessWarning(
        processMonitor,
        status,
        errorMessage,
        tradeDay
      );
    }

    return processStatus;
  }

  /**
   * 查找进程
   */
  private async findProcess(
    ssh: NodeSSH,
    processMonitor: ProcessMonitor
  ): Promise<ProcessInfo | null> {
    let pattern: string;

    // 优先使用 PID 文件
    if (processMonitor.pid_file) {
      const { stdout: pidStr } = await ssh.execCommand(
        `cat ${processMonitor.pid_file} 2>/dev/null || echo ""`
      );
      const pid = parseInt(pidStr.trim(), 10);
      if (pid && !isNaN(pid)) {
        return await this.getProcessInfoByPid(ssh, pid);
      }
    }

    // 使用命令模式或进程名
    if (processMonitor.command_pattern) {
      pattern = processMonitor.command_pattern;
    } else if (processMonitor.process_name) {
      pattern = processMonitor.process_name;
    } else {
      return null;
    }

    // 查找进程 PID
    const command = `ps aux | grep -E "${pattern}" | grep -v grep | awk '{print $2}' | head -1`;
    const { stdout: pidStr, code } = await ssh.execCommand(command);

    if (code !== 0 || !pidStr.trim()) {
      return null;
    }

    const pid = parseInt(pidStr.trim(), 10);
    if (isNaN(pid)) {
      return null;
    }

    return await this.getProcessInfoByPid(ssh, pid);
  }

  /**
   * 通过 PID 获取进程详细信息
   */
  private async getProcessInfoByPid(
    ssh: NodeSSH,
    pid: number
  ): Promise<ProcessInfo | null> {
    // 获取进程详细信息
    // ps -p <pid> -o pid,pcpu,pmem,etime,start,cmd --no-headers
    let command = `ps -p ${pid} -o pid,ppid,pcpu,pmem,etime,start,cmd --no-headers 2>/dev/null || echo ""`;
    const { stdout, code } = await ssh.execCommand(command);

    if (code !== 0 || !stdout.trim()) {
      return null;
    }

    // 解析输出
    // 格式: PID %CPU %MEM ELAPSED START CMD
    const parts = stdout.trim().split(/\s+/);
    if (parts.length < 6) {
      return null;
    }

    const pid_parsed = parseInt(parts[0], 10);
    const ppid_parsed = parseInt(parts[1], 10);
    const cpu_percent = parseFloat(parts[2]);
    const memory_percent = parseFloat(parts[3]);
    const etime = parts[4]; // 运行时长，格式如: 1-02:03:04 或 02:03:04
    const start = parts[5]; // 启动时间，格式如: 10:30:45
    command = parts.slice(6).join(' ');

    // 解析运行时长（秒）
    const uptimeSeconds = this.parseEtime(etime);

    // 解析启动时间
    const startTime = this.parseStartTime(start);

    // 获取内存使用量（MB）
    // 使用 ps 获取 RSS (实际内存使用量，单位 KB)
    const { stdout: rssStr } = await ssh.execCommand(
      `ps -p ${pid} -o rss --no-headers 2>/dev/null || echo "0"`
    );
    const rssKb = parseFloat(rssStr.trim()) || 0;
    const memoryUsedMb = rssKb / 1024;

    return {
      pid: pid_parsed,
      ppid: ppid_parsed,
      cpu_percent,
      memory_percent,
      memory_used_mb: memoryUsedMb,
      uptime_seconds: uptimeSeconds,
      start_time: startTime,
      command,
    };
  }

  /**
   * 解析运行时长（ELAPSED 格式）
   * 格式: 1-02:03:04 (天-时:分:秒) 或 02:03:04 (时:分:秒)
   */
  private parseEtime(etime: string): number {
    if (!etime) return 0;

    // 如果包含 "-"，表示有天数
    if (etime.includes('-')) {
      const [days, time] = etime.split('-');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return (
        parseInt(days, 10) * 86400 +
        (hours || 0) * 3600 +
        (minutes || 0) * 60 +
        (seconds || 0)
      );
    } else {
      // 只有时:分:秒
      const parts = etime.split(':').map(Number);
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
    }
    return 0;
  }

  /**
   * 解析启动时间
   * 格式: HH:MM:SS 或 MMMDD (如果超过24小时)
   */
  private parseStartTime(start: string): Date {
    if (!start) return new Date();

    // 如果是时间格式 HH:MM:SS
    if (start.includes(':')) {
      const [hours, minutes, seconds] = start.split(':').map(Number);
      const now = new Date();
      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        seconds
      );
      // 如果时间在未来，说明是昨天启动的
      if (startTime > now) {
        startTime.setDate(startTime.getDate() - 1);
      }
      return startTime;
    }

    // 如果是日期格式 MMMDD，需要更复杂的解析
    // 这里简化处理，返回当前时间
    return new Date();
  }

  /**
   * 创建进程状态记录
   */
  private async createProcessStatus(
    processMonitorId: number,
    tradeDay: string,
    status: ProcessStatusType,
    pid: number | null,
    ppid: number | null,
    cmd: string | null,
    cpuPercent: number | null,
    memoryPercent: number | null,
    memoryUsedMb: number | null,
    uptimeSeconds: number | null,
    startTime: Date | null,
    checkDurationMs: number,
    errorMessage: string | null = null
  ): Promise<ProcessStatus> {
    return await this.prismaService.processStatus.create({
      data: {
        processMonitorId,
        trade_day: tradeDay,
        status,
        pid,
        ppid,
        cmd,
        cpu_percent: cpuPercent,
        memory_percent: memoryPercent,
        memory_used_mb: memoryUsedMb,
        uptime_seconds: uptimeSeconds,
        start_time: startTime,
        check_duration_ms: checkDurationMs,
        error_message: errorMessage,
      },
    });
  }

  /**
   * 检查告警阈值
   */
  private async checkThresholds(
    processMonitor: ProcessMonitor,
    cpuPercent: number,
    memoryPercent: number,
    tradeDay: string
  ): Promise<void> {
    // 检查 CPU 阈值
    if (
      processMonitor.cpu_threshold &&
      cpuPercent > processMonitor.cpu_threshold
    ) {
      await this.createProcessWarning(
        processMonitor,
        ProcessStatusType.RUNNING,
        `CPU usage ${cpuPercent.toFixed(2)}% exceeds threshold ${
          processMonitor.cpu_threshold
        }%`,
        tradeDay,
        OpsWarningType.PROCESS_HIGH_CPU
      );
    }

    // 检查内存阈值
    if (
      processMonitor.memory_threshold &&
      memoryPercent > processMonitor.memory_threshold
    ) {
      await this.createProcessWarning(
        processMonitor,
        ProcessStatusType.RUNNING,
        `Memory usage ${memoryPercent.toFixed(2)}% exceeds threshold ${
          processMonitor.memory_threshold
        }%`,
        tradeDay,
        OpsWarningType.PROCESS_HIGH_MEMORY
      );
    }
  }

  /**
   * 创建进程警告
   */
  private async createProcessWarning(
    processMonitor: ProcessMonitor & {
      hostServer?: { id: number };
      fundAccount?: { account: string } | null;
    },
    status: ProcessStatusType,
    errorMessage: string | null,
    tradeDay: string,
    warningType?: OpsWarningType
  ): Promise<void> {
    let type: OpsWarningType;

    if (warningType) {
      type = warningType;
    } else if (status === ProcessStatusType.NOT_FOUND) {
      type = OpsWarningType.PROCESS_NOT_RUNNING;
    } else if (status === ProcessStatusType.ERROR) {
      type = OpsWarningType.PROCESS_CHECK_FAILED;
    } else {
      type = OpsWarningType.PROCESS_CRASHED;
    }

    const warningData: Prisma.OpsWarningCreateInput = {
      trade_day: tradeDay,
      status: OpsWarningStatus.PENDING,
      type,
      text:
        errorMessage ||
        `Process monitor ${processMonitor.name} status: ${status}`,
      hostServer: processMonitor.hostServer
        ? { connect: { id: processMonitor.hostServer.id } }
        : undefined,
      fundAccount: processMonitor.fund_account
        ? { connect: { account: processMonitor.fund_account } }
        : undefined,
    };

    await this.prismaService.opsWarning.create({
      data: warningData,
    });

    this.logger.warn(
      `Created process warning: ${type} for ProcessMonitor ${processMonitor.id} - ${errorMessage}`
    );
  }

  /**
   * 检查所有启用的进程监控
   */
  async checkAllProcesses(): Promise<void> {
    const processMonitors = await this.prismaService.processMonitor.findMany({
      where: {
        active: true,
      },
      include: {
        hostServer: {
          select: {
            id: true,
            ssh_host: true,
            ssh_port: true,
            ssh_user: true,
          },
        },
      },
    });

    this.logger.log(
      `Starting to check ${processMonitors.length} process monitors`
    );

    for (const monitor of processMonitors) {
      try {
        await this.checkProcessStatus(monitor);
      } catch (error) {
        this.logger.error(
          `Failed to check ProcessMonitor ${monitor.id}: ${error.message}`,
          error.stack
        );
      }
    }

    this.logger.log('Finished checking all process monitors');
  }

  /**
   * 检查当前时间是否在监控时间范围内
   */
  private isWithinMonitorTimeRange(): boolean {
    const now = dayjs();
    const currentTime = now.format('HH:mm');
    const startTime = settings.process_monitor.start_time;
    const endTime = settings.process_monitor.end_time;

    // 如果开始时间小于等于结束时间（同一天内）
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 如果开始时间大于结束时间（跨天）
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 定时任务：每 5 分钟检查一次所有启用的进程
   */
  @Cron('*/5 * * * *')
  async scheduledCheckAllProcesses(): Promise<void> {
    // 检查是否在监控时间范围内
    if (!this.isWithinMonitorTimeRange()) {
      this.logger.debug(
        `Skipping process monitor check: current time is outside monitor time range (${settings.process_monitor.start_time} - ${settings.process_monitor.end_time})`
      );
      return;
    }

    await this.checkAllProcesses();
  }

  /**
   * 获取进程监控配置列表
   */
  async listProcessMonitors(params?: {
    hostServerId?: number;
    fundAccountId?: string;
    processType?: ProcessType;
    active?: boolean;
  }) {
    const where: Prisma.ProcessMonitorWhereInput = {};

    if (params?.hostServerId) {
      where.hostServerId = params.hostServerId;
    }

    if (params?.fundAccountId) {
      where.fund_account = params.fundAccountId;
    }

    if (params?.processType) {
      where.process_type = params.processType;
    }

    if (params?.active !== undefined) {
      where.active = params.active;
    }

    const data = await this.prismaService.processMonitor.findMany({
      where,
      include: {
        hostServer: {
          select: {
            id: true,
            name: true,
            ssh_host: true,
            ssh_port: true,
          },
        },
        fundAccount: {
          select: {
            account: true,
            brokerKey: true,
            productKey: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data,
      total: data.length,
    };
  }

  /**
   * 创建进程监控配置
   */
  async createProcessMonitor(
    data: Prisma.ProcessMonitorCreateInput
  ): Promise<ProcessMonitor> {
    return await this.prismaService.processMonitor.create({
      data,
      include: {
        hostServer: true,
        fundAccount: true,
      },
    });
  }

  /**
   * 更新进程监控配置
   */
  async updateProcessMonitor(
    id: number,
    data: Prisma.ProcessMonitorUpdateInput
  ): Promise<ProcessMonitor> {
    return await this.prismaService.processMonitor.update({
      where: { id },
      data,
      include: {
        hostServer: true,
        fundAccount: true,
      },
    });
  }

  /**
   * 删除进程监控配置
   */
  async deleteProcessMonitor(id: number): Promise<ProcessMonitor> {
    return await this.prismaService.processMonitor.delete({
      where: { id },
      include: {
        hostServer: true,
        fundAccount: true,
      },
    });
  }

  /**
   * 获取进程状态历史
   */
  async getProcessStatusHistory(params: {
    processMonitorId?: number;
    tradeDay?: string;
    limit?: number;
  }) {
    const where: Prisma.ProcessStatusWhereInput = {};

    if (params.processMonitorId) {
      where.processMonitorId = params.processMonitorId;
    }

    if (params.tradeDay) {
      where.trade_day = params.tradeDay;
    }

    const data = await this.prismaService.processStatus.findMany({
      where,
      include: {
        processMonitor: {
          include: {
            hostServer: {
              select: {
                id: true,
                name: true,
              },
            },
            fundAccount: {
              select: {
                account: true,
              },
            },
          },
        },
      },
      orderBy: {
        checked_at: 'desc',
      },
      take: params.limit || 100,
    });

    return {
      data,
      total: data.length,
    };
  }

  /**
   * 获取最新的进程状态
   */
  async getLatestProcessStatus(processMonitorId: number) {
    return await this.prismaService.processStatus.findFirst({
      where: {
        processMonitorId,
      },
      include: {
        processMonitor: {
          include: {
            hostServer: true,
            fundAccount: true,
          },
        },
      },
      orderBy: {
        checked_at: 'desc',
      },
    });
  }

  /**
   * 手动触发进程检查
   */
  async triggerCheck(processMonitorId: number): Promise<ProcessStatus> {
    const processMonitor = await this.prismaService.processMonitor.findUnique({
      where: { id: processMonitorId },
      include: {
        hostServer: {
          select: {
            id: true,
            ssh_host: true,
            ssh_port: true,
            ssh_user: true,
          },
        },
      },
    });

    if (!processMonitor) {
      throw new Error(`ProcessMonitor ${processMonitorId} not found`);
    }

    return await this.checkProcessStatus(processMonitor);
  }

  /**
   * 杀死进程
   * 根据最新的进程状态中的 pid 和 ppid 来杀死进程
   */
  async killProcess(processMonitorId: number): Promise<{
    success: boolean;
    message: string;
    killedPids: number[];
  }> {
    // 获取进程监控配置
    const processMonitor = await this.prismaService.processMonitor.findUnique({
      where: { id: processMonitorId },
      include: {
        hostServer: {
          select: {
            id: true,
            ssh_host: true,
            ssh_port: true,
            ssh_user: true,
          },
        },
      },
    });

    if (!processMonitor) {
      throw new Error(`ProcessMonitor ${processMonitorId} not found`);
    }

    // 获取最新的进程状态
    const latestStatus = await this.prismaService.processStatus.findFirst({
      where: {
        processMonitorId,
      },
      orderBy: {
        checked_at: 'desc',
      },
    });

    if (!latestStatus || !latestStatus.pid) {
      throw new Error(
        `No running process found for ProcessMonitor ${processMonitorId}. PID is not available.`
      );
    }

    // 获取完整的 HostServer 信息
    const fullHostServer = await this.prismaService.hostServer.findUnique({
      where: { id: processMonitor.hostServer.id },
    });

    if (
      !fullHostServer ||
      !fullHostServer.ssh_host ||
      !fullHostServer.ssh_port ||
      !fullHostServer.ssh_user
    ) {
      throw new Error(
        `HostServer ${processMonitor.hostServer.id} SSH configuration is incomplete`
      );
    }

    const ssh = await this.hostServerService.connect(fullHostServer);
    const killedPids: number[] = [];

    try {
      // 收集需要杀死的进程 PID（包括子进程和父进程）
      const pidsToKill: number[] = [];

      // 添加主进程 PID
      if (latestStatus.pid) {
        pidsToKill.push(latestStatus.pid);
      }

      // 添加父进程 PID
      if (latestStatus.ppid) {
        pidsToKill.push(latestStatus.ppid);
      }

      if (pidsToKill.length === 0) {
        throw new Error('No PID available to kill');
      }

      // 去重
      const uniquePids = [...new Set(pidsToKill)];

      this.logger.log(
        `Attempting to kill processes for ProcessMonitor ${processMonitorId}: PIDs ${uniquePids.join(
          ', '
        )}`
      );

      // 先尝试优雅地终止（SIGTERM）
      for (const pid of uniquePids) {
        try {
          // 检查进程是否存在
          const { code: checkCode } = await ssh.execCommand(
            `ps -p ${pid} > /dev/null 2>&1`
          );

          // checkCode 为 0 表示进程存在
          if (checkCode === 0) {
            // 发送 SIGTERM 信号
            const { code: killCode, stderr } = await ssh.execCommand(
              `kill -TERM ${pid} 2>&1`
            );

            if (killCode === 0) {
              killedPids.push(pid);
              this.logger.log(`Sent SIGTERM to process ${pid}`);
            } else {
              this.logger.warn(
                `Failed to send SIGTERM to process ${pid}: ${
                  stderr || 'unknown error'
                }`
              );
            }
          } else {
            this.logger.warn(`Process ${pid} does not exist`);
          }
        } catch (error) {
          this.logger.error(
            `Error while killing process ${pid}: ${error.message}`
          );
        }
      }

      // 等待一段时间让进程优雅退出
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 检查哪些进程还在运行，强制杀死（SIGKILL）
      for (const pid of uniquePids) {
        try {
          // 检查进程是否还在运行
          const { code: checkCode } = await ssh.execCommand(
            `ps -p ${pid} > /dev/null 2>&1`
          );

          // checkCode 为 0 表示进程存在
          if (checkCode === 0) {
            // 进程还在运行，强制杀死
            if (killedPids.includes(pid)) {
              this.logger.warn(
                `Process ${pid} is still running after SIGTERM, sending SIGKILL`
              );
            } else {
              this.logger.log(
                `Process ${pid} exists but SIGTERM was not sent, sending SIGKILL directly`
              );
            }

            const { code: killCode, stderr } = await ssh.execCommand(
              `kill -KILL ${pid} 2>&1`
            );

            if (killCode === 0) {
              if (!killedPids.includes(pid)) {
                killedPids.push(pid);
              }
              this.logger.log(`Sent SIGKILL to process ${pid}`);
            } else {
              this.logger.error(
                `Failed to send SIGKILL to process ${pid}: ${
                  stderr || 'unknown error'
                }`
              );
            }
          } else {
            // 进程已经不存在了
            if (killedPids.includes(pid)) {
              this.logger.log(`Process ${pid} has been terminated`);
            }
          }
        } catch (error) {
          this.logger.error(
            `Error while force killing process ${pid}: ${error.message}`
          );
        }
      }

      const success = killedPids.length > 0;
      const message = success
        ? `Successfully killed ${
            killedPids.length
          } process(es): ${killedPids.join(', ')}`
        : `Failed to kill any process`;

      this.logger.log(
        `Kill process result for ProcessMonitor ${processMonitorId}: ${message}`
      );

      // 杀死进程后，刷新进程监控状态
      if (success) {
        try {
          // 等待一小段时间，让系统有时间更新进程状态
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 重新获取完整的 processMonitor 信息（包含 hostServer）
          const updatedProcessMonitor =
            await this.prismaService.processMonitor.findUnique({
              where: { id: processMonitorId },
              include: {
                hostServer: {
                  select: {
                    id: true,
                    ssh_host: true,
                    ssh_port: true,
                    ssh_user: true,
                  },
                },
              },
            });

          if (updatedProcessMonitor) {
            await this.checkProcessStatus(updatedProcessMonitor);
            this.logger.log(
              `Refreshed process status for ProcessMonitor ${processMonitorId} after killing process`
            );
          }
        } catch (error) {
          // 刷新状态失败不影响返回结果，只记录警告
          this.logger.warn(
            `Failed to refresh process status after killing process for ProcessMonitor ${processMonitorId}: ${error.message}`
          );
        }
      }

      return {
        success,
        message,
        killedPids,
      };
    } catch (error) {
      this.logger.error(
        `Failed to kill process for ProcessMonitor ${processMonitorId}: ${error.message}`,
        error.stack
      );
      throw error;
    } finally {
      ssh?.dispose();
    }
  }

  /**
   * 同步配置文件到 HostServer
   */
  async syncConfigFile(
    processMonitorId: number,
    configFile: string,
    content: string
  ): Promise<{ success: boolean; message: string }> {
    // 查询 ProcessMonitor 及其关联的 HostServer
    const processMonitor = await this.prismaService.processMonitor.findUnique({
      where: { id: processMonitorId },
      include: {
        hostServer: true,
      },
    });

    if (!processMonitor) {
      throw new Error(`ProcessMonitor ${processMonitorId} not found`);
    }

    const hostServer = processMonitor.hostServer;

    if (!hostServer.ssh_host || !hostServer.ssh_port || !hostServer.ssh_user) {
      throw new Error(
        `HostServer ${hostServer.id} SSH configuration is incomplete`
      );
    }

    const ssh = await this.hostServerService.connect(hostServer);

    // 创建临时文件
    const tempFilePath = path.join(
      os.tmpdir(),
      `config_${processMonitorId}_${Date.now()}_${path.basename(configFile)}`
    );

    try {
      // 确保目录存在
      const lastSlashIndex = configFile.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        const dirPath = configFile.substring(0, lastSlashIndex);
        await ssh.execCommand(`mkdir -p "${dirPath}"`);
      }

      // 写入内容到临时文件
      fs.writeFileSync(tempFilePath, content, 'utf-8');

      // 上传文件到远程服务器
      await ssh.putFile(tempFilePath, configFile);

      // 更新 ProcessMonitor 的 configs 字段
      const existingConfigs = (processMonitor.configs || []) as Array<{
        config_file: string;
        cfg: string;
      }>;

      // 查找是否已存在该配置文件
      const configIndex = existingConfigs.findIndex(
        (c) => c.config_file === configFile
      );

      const updatedConfig = {
        config_file: configFile,
        cfg: content,
      };

      if (configIndex >= 0) {
        // 更新现有配置
        existingConfigs[configIndex] = updatedConfig;
      } else {
        // 添加新配置
        existingConfigs.push(updatedConfig);
      }

      await this.prismaService.processMonitor.update({
        where: { id: processMonitorId },
        data: {
          configs: existingConfigs as any,
        },
      });

      this.logger.log(
        `Successfully synced config file ${configFile} for ProcessMonitor ${processMonitorId}`
      );

      return {
        success: true,
        message: `Successfully synced config file ${configFile}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync config file for ProcessMonitor ${processMonitorId}: ${error.message}`,
        error.stack
      );
      throw error;
    } finally {
      // 删除临时文件
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      ssh?.dispose();
    }
  }
}
