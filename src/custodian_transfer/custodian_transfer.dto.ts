import { Market, TransferDirection } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCustodianTransferDto {
  @IsNotEmpty()
  @IsString()
  fund_account: string;

  @IsNotEmpty()
  @IsEnum(TransferDirection)
  direction: TransferDirection;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  transfer_date: string;

  @IsOptional()
  @IsEnum(Market)
  market?: Market;

  @IsOptional()
  @IsNumber()
  subscription_redemption_id?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  operator?: string;
}

export class UpdateCustodianTransferDto {
  @IsOptional()
  @IsString()
  fund_account?: string;

  @IsOptional()
  @IsEnum(TransferDirection)
  direction?: TransferDirection;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  transfer_date?: string;

  @IsOptional()
  @IsEnum(Market)
  market?: Market;

  @IsOptional()
  @IsNumber()
  subscription_redemption_id?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  operator?: string;
}

export class ListCustodianTransferQueryDto {
  @IsOptional()
  @IsString()
  fund_account?: string;
}

export class CandidatesQueryDto {
  @IsNotEmpty()
  @IsString()
  fund_account: string;

  @IsNotEmpty()
  @IsEnum(TransferDirection)
  direction: TransferDirection;
}

export class CustodianTransferEntity {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  fund_account: string;

  @IsNotEmpty()
  @IsEnum(TransferDirection)
  direction: TransferDirection;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  transfer_date: string;

  @IsOptional()
  @IsEnum(Market)
  market?: Market | null;

  @IsOptional()
  @IsString()
  remark?: string | null;

  @IsOptional()
  @IsString()
  operator?: string | null;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsOptional()
  @IsNumber()
  subscription_redemption_id?: number | null;
}
