import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcessType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProcessMonitorDto {
  @ApiProperty({ description: '进程名称/标识' })
  @IsString()
  name: string;

  @ApiProperty({ description: '进程类型', enum: ProcessType })
  @IsEnum(ProcessType)
  process_type: ProcessType;

  @ApiProperty({ description: '关联的 HostServer ID' })
  @IsInt()
  hostServerId: number;

  @ApiPropertyOptional({
    description: '如果是交易程序，关联 FundAccount account',
  })
  @IsString()
  @IsOptional()
  fundAccountId?: string;

  @ApiPropertyOptional({ description: '进程名称（用于 ps 命令匹配）' })
  @IsString()
  @IsOptional()
  process_name?: string;

  @ApiPropertyOptional({ description: '命令模式（用于更精确匹配）' })
  @IsString()
  @IsOptional()
  command_pattern?: string;

  @ApiPropertyOptional({ description: 'PID 文件路径' })
  @IsString()
  @IsOptional()
  pid_file?: string;

  @ApiPropertyOptional({ description: '是否启用监控', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: '检查间隔（秒）', default: 60 })
  @IsInt()
  @Min(10)
  @IsOptional()
  check_interval?: number;

  @ApiPropertyOptional({ description: '监控开始时间' })
  @IsOptional()
  monitor_start_time?: Date;

  @ApiPropertyOptional({ description: '监控结束时间' })
  @IsOptional()
  monitor_end_time?: Date;

  @ApiPropertyOptional({ description: 'CPU 使用率告警阈值（0-100）' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  cpu_threshold?: number;

  @ApiPropertyOptional({ description: '内存使用率告警阈值（0-100）' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  memory_threshold?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
