import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProcessType } from '@prisma/client';

import { CreateProcessMonitorDto } from './dto/create-process-monitor.dto';
import { SyncConfigFileDto } from './dto/sync-config-file.dto';
import { UpdateProcessMonitorDto } from './dto/update-process-monitor.dto';
import { ProcessMonitorService } from './process-monitor.service';

@ApiTags('process-monitor')
@Controller('/process-monitor')
export class ProcessMonitorController {
  constructor(private readonly processMonitorService: ProcessMonitorService) {}

  /**
   * 获取进程监控配置列表
   */
  @ApiOperation({
    operationId: 'listProcessMonitors',
    summary: '获取进程监控配置列表',
    description: '获取所有进程监控配置列表，支持筛选',
  })
  @ApiQuery({ name: 'hostServerId', required: false, type: Number })
  @ApiQuery({ name: 'fundAccountId', required: false, type: String })
  @ApiQuery({ name: 'processType', required: false, enum: ProcessType })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiOkResponse({ description: '进程监控配置列表' })
  @Get()
  async listProcessMonitors(
    @Query('hostServerId') hostServerId?: number,
    @Query('fundAccountId') fundAccountId?: string,
    @Query('processType') processType?: ProcessType,
    @Query('active') active?: boolean
  ) {
    return await this.processMonitorService.listProcessMonitors({
      hostServerId: hostServerId
        ? parseInt(String(hostServerId), 10)
        : undefined,
      fundAccountId,
      processType,
      active: active !== undefined ? active === true : undefined,
    });
  }

  /**
   * 创建进程监控配置
   */
  @ApiOperation({
    operationId: 'createProcessMonitor',
    summary: '创建进程监控配置',
    description: '创建一个新的进程监控配置',
  })
  @ApiCreatedResponse({ description: '进程监控配置创建成功' })
  @Post()
  async createProcessMonitor(@Body() dto: CreateProcessMonitorDto) {
    return await this.processMonitorService.createProcessMonitor({
      name: dto.name,
      process_type: dto.process_type,
      hostServer: {
        connect: { id: dto.hostServerId },
      },
      fundAccount: dto.fundAccountId
        ? { connect: { account: dto.fundAccountId } }
        : undefined,
      process_name: dto.process_name,
      command_pattern: dto.command_pattern,
      pid_file: dto.pid_file,
      active: dto.active ?? true,
      check_interval: dto.check_interval ?? 60,
      monitor_start_time: dto.monitor_start_time,
      monitor_end_time: dto.monitor_end_time,
      cpu_threshold: dto.cpu_threshold,
      memory_threshold: dto.memory_threshold,
      remark: dto.remark,
    });
  }

  /**
   * 更新进程监控配置
   */
  @ApiOperation({
    operationId: 'updateProcessMonitor',
    summary: '更新进程监控配置',
    description: '更新指定的进程监控配置',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: '进程监控配置更新成功' })
  @Put('/:id')
  async updateProcessMonitor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcessMonitorDto
  ) {
    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.process_type !== undefined)
      updateData.process_type = dto.process_type;
    if (dto.hostServerId !== undefined) {
      updateData.hostServer = { connect: { id: dto.hostServerId } };
    }
    if (dto.fundAccountId !== undefined) {
      updateData.fundAccount = dto.fundAccountId
        ? { connect: { account: dto.fundAccountId } }
        : { disconnect: true };
    }
    if (dto.process_name !== undefined)
      updateData.process_name = dto.process_name;
    if (dto.command_pattern !== undefined)
      updateData.command_pattern = dto.command_pattern;
    if (dto.pid_file !== undefined) updateData.pid_file = dto.pid_file;
    if (dto.active !== undefined) updateData.active = dto.active;
    if (dto.check_interval !== undefined)
      updateData.check_interval = dto.check_interval;
    if (dto.monitor_start_time !== undefined)
      updateData.monitor_start_time = dto.monitor_start_time;
    if (dto.monitor_end_time !== undefined)
      updateData.monitor_end_time = dto.monitor_end_time;
    if (dto.cpu_threshold !== undefined)
      updateData.cpu_threshold = dto.cpu_threshold;
    if (dto.memory_threshold !== undefined)
      updateData.memory_threshold = dto.memory_threshold;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    return await this.processMonitorService.updateProcessMonitor(
      id,
      updateData
    );
  }

  /**
   * 删除进程监控配置
   */
  @ApiOperation({
    operationId: 'deleteProcessMonitor',
    summary: '删除进程监控配置',
    description: '删除指定的进程监控配置',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: '进程监控配置删除成功' })
  @Delete('/:id')
  async deleteProcessMonitor(@Param('id', ParseIntPipe) id: number) {
    return await this.processMonitorService.deleteProcessMonitor(id);
  }

  /**
   * 获取进程状态历史
   */
  @ApiOperation({
    operationId: 'getProcessStatusHistory',
    summary: '获取进程状态历史',
    description: '获取进程状态的历史记录',
  })
  @ApiQuery({ name: 'processMonitorId', required: false, type: Number })
  @ApiQuery({ name: 'tradeDay', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: '进程状态历史记录' })
  @Get('/status/history')
  async getProcessStatusHistory(
    @Query('processMonitorId') processMonitorId?: number,
    @Query('tradeDay') tradeDay?: string,
    @Query('limit') limit?: number
  ) {
    return await this.processMonitorService.getProcessStatusHistory({
      processMonitorId: processMonitorId
        ? parseInt(String(processMonitorId), 10)
        : undefined,
      tradeDay,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    });
  }

  /**
   * 获取最新的进程状态
   */
  @ApiOperation({
    operationId: 'getLatestProcessStatus',
    summary: '获取最新的进程状态',
    description: '获取指定进程监控的最新状态',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: '最新的进程状态' })
  @Get('/:id/status/latest')
  async getLatestProcessStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.processMonitorService.getLatestProcessStatus(id);
  }

  /**
   * 手动触发进程检查
   */
  @ApiOperation({
    operationId: 'triggerCheck',
    summary: '手动触发进程检查',
    description: '立即检查指定进程监控的状态',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: '进程检查结果' })
  @Post('/:id/check')
  async triggerCheck(@Param('id', ParseIntPipe) id: number) {
    return await this.processMonitorService.triggerCheck(id);
  }

  /**
   * 杀死进程
   */
  @ApiOperation({
    operationId: 'killProcess',
    summary: '杀死进程',
    description: '根据最新的进程状态中的 pid 和 ppid 来杀死进程（包括父进程）',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: '进程杀死结果' })
  @Post('/:id/@kill')
  async killProcess(@Param('id', ParseIntPipe) id: number) {
    return await this.processMonitorService.killProcess(id);
  }

  /**
   * 同步配置文件到 HostServer
   */
  @ApiOperation({
    operationId: 'syncConfigFile',
    summary: '同步配置文件到 HostServer',
    description:
      '将配置文件内容通过 SSH 同步到对应的 HostServer 上，并更新 ProcessMonitor 的 configs 字段',
  })
  @ApiOkResponse({ description: '配置文件同步成功' })
  @Post('/sync-config-file')
  async syncConfigFile(@Body() dto: SyncConfigFileDto) {
    return await this.processMonitorService.syncConfigFile(
      dto.processMonitorId,
      dto.config_file,
      dto.cfg
    );
  }
}
