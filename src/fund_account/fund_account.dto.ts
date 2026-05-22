import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryNextTradingDayDto {
  @IsNotEmpty()
  @IsString()
  base_date: string;
}

export class NextTradingDayEntity {
  @IsNotEmpty()
  @IsString()
  next_trading_day: string;
}

export class QueryStockAccountDto {
  @IsNotEmpty()
  @IsString()
  market: string;
}

export class InnerSnapshotFromServer {
  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @IsNotEmpty()
  @IsNumber()
  buying_power: number;

  @IsNotEmpty()
  @IsNumber()
  frozen: number;

  /**
   * 1: 深圳 2: 上海
   */
  @IsNotEmpty()
  @IsNumber()
  market: number;

  @IsObject()
  xtp_account?: object;

  @IsObject()
  atp_account?: object;
}

export enum TransferDirection {
  IN = 'IN',
  OUT = 'OUT',
}

export class TransferDto {
  // 市场
  @IsNotEmpty()
  @IsString()
  market: string;

  @IsNotEmpty()
  @IsEnum(TransferDirection)
  direction: TransferDirection;

  // 转账金额
  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  amount: number;
}

export class ListFundAccountQueryDto {
  /**
   * 券商key, eg: xtp, guojun
   */
  @IsOptional()
  @IsString()
  brokerKey?: string;

  /**
   * 公司key, eg: zouwu, zhisui
   */
  @IsOptional()
  @IsString()
  companyKey?: string;

  /**
   * 产品key, eg: zy1
   */
  @IsOptional()
  @IsString()
  productKey?: string;

  /**
   * 是否启用, 默认为 true
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ListFundSnapshotQueryDto {
  @IsNotEmpty()
  @IsString()
  trade_day: string;

  @IsNotEmpty()
  @IsString()
  market: string;
}

export class FundSnapshotEntity {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsString()
  market: string;

  @IsNotEmpty()
  @IsString()
  fund_account: string;

  @IsNotEmpty()
  @IsString()
  trade_day: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @IsNotEmpty()
  @IsNumber()
  buying_power: number;

  @IsNotEmpty()
  @IsNumber()
  frozen: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsOptional()
  @IsObject()
  xtp_account?: object | null;

  @IsOptional()
  @IsObject()
  atp_account?: object | null;
}

export class FundAccountEntity {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  brokerKey: string;

  @IsNotEmpty()
  @IsString()
  productKey: string;

  @IsNotEmpty()
  @IsString()
  companyKey: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

export class TransferRecordEntity {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  fund_account: string;

  @IsNotEmpty()
  @IsString()
  trade_day: string;

  @IsNotEmpty()
  @IsString()
  market: string;

  @IsNotEmpty()
  @IsEnum(TransferDirection)
  direction: TransferDirection;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsArray()
  snapshots: FundSnapshotEntity[];
}
