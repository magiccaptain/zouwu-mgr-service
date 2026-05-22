import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class SyncConfigFileDto {
  @ApiProperty({ description: 'ProcessMonitor ID' })
  @IsInt()
  processMonitorId: number;

  @ApiProperty({ description: '配置文件路径' })
  @IsString()
  config_file: string;

  @ApiProperty({ description: '配置文件内容' })
  @IsString()
  cfg: string;
}
