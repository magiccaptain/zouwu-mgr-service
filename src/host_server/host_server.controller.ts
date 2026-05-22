import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import { HostServerService } from './host_server.service';

class HostServerDto {
  @ApiProperty({ description: '主机服务器ID' })
  id: number;

  @ApiProperty({ description: '主机服务器名称' })
  name: string;

  @ApiProperty({ description: '描述', required: false })
  desc?: string;

  @ApiProperty({ description: '市场' })
  market: string;

  @ApiProperty({ description: '主机IP', required: false })
  host_ip?: string;

  @ApiProperty({ description: 'SSH主机', required: false })
  ssh_host?: string;

  @ApiProperty({ description: 'SSH用户', required: false })
  ssh_user?: string;

  @ApiProperty({ description: 'SSH端口', required: false })
  ssh_port?: number;

  @ApiProperty({ description: '主目录', required: false })
  home_dir?: string;

  @ApiProperty({ description: '是否激活' })
  active: boolean;

  @ApiProperty({ description: '是否为主服务器' })
  is_master: boolean;

  @ApiProperty({ description: '最后检查时间', required: false })
  last_check_at?: Date;

  @ApiProperty({ description: '券商密钥', required: false })
  brokerKey?: string;

  @ApiProperty({ description: '公司密钥', required: false })
  companyKey?: string;

  @ApiProperty({ description: '备注', required: false })
  remark?: string;

  @ApiProperty({ description: '磁盘总数(GB)', required: false })
  disk_total?: number;

  @ApiProperty({ description: '磁盘使用量(GB)', required: false })
  disk_used?: number;

  @ApiProperty({ description: '主机名', required: false })
  hostname?: string;

  @ApiProperty({ description: '操作系统', required: false })
  os?: string;

  @ApiProperty({ description: '操作系统版本', required: false })
  os_version?: string;

  @ApiProperty({ description: 'CPU型号', required: false })
  cpu_model?: string;

  @ApiProperty({ description: 'CPU核数', required: false })
  cpu_cores?: number;

  @ApiProperty({ description: '内存大小(MB)', required: false })
  memory_size?: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

class ListHostServersResponse {
  @ApiProperty({ description: '主机服务器列表', type: [HostServerDto] })
  data: HostServerDto[];

  @ApiProperty({ description: '总数' })
  total: number;
}

@ApiTags('host-server')
@Controller('/host-server')
export class HostServerController {
  constructor(private readonly hostServerService: HostServerService) {}

  /**
   * 获取主机服务器列表
   */
  @ApiOperation({
    operationId: 'listHostServers',
    summary: '获取主机服务器列表',
    description: '获取所有主机服务器列表',
  })
  @ApiOkResponse({
    description: '主机服务器列表',
    type: ListHostServersResponse,
  })
  @Get()
  async listHostServers(): Promise<ListHostServersResponse> {
    const result = await this.hostServerService.listHostServers();

    return {
      data: result.data as HostServerDto[],
      total: result.total,
    };
  }
}
