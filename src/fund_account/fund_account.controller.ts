import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import dayjs from 'dayjs';

import { settings } from 'src/config';

import {
  FundAccountEntity,
  FundSnapshotEntity,
  InnerSnapshotFromServer,
  ListFundAccountQueryDto,
  ListFundSnapshotQueryDto,
  QueryStockAccountDto,
  TransferDto,
  TransferRecordEntity,
} from './fund_account.dto';
import { FundAccountService } from './fund_account.service';

@Controller('fund-account')
export class FundAccountController {
  constructor(private readonly fundAccountService: FundAccountService) {}

  cannotDoInTradeTime() {
    const now = dayjs();

    const traderStart = dayjs(
      now.format('YYYY-MM-DD ') + settings.trader.start_time,
      'YYYY-MM-DD HH:mm'
    );
    const traderEnd = dayjs(
      now.format('YYYY-MM-DD ') + settings.trader.end_time,
      'YYYY-MM-DD HH:mm'
    );

    const is_trade_time = now.isAfter(traderStart) && now.isBefore(traderEnd);

    if (is_trade_time) {
      throw new ForbiddenException(
        `该操作禁止在 ${settings.trader.start_time} - ${settings.trader.end_time} 之间进行`
      );
    }
  }

  @ApiOperation({ operationId: 'innerTransfer' })
  @ApiOkResponse({
    description: 'inner transfer',
    type: TransferRecordEntity,
  })
  @Post(':fund_account/@inner-transfer')
  innerTransfer(
    @Param('fund_account') fund_account: string,
    @Body() dto: TransferDto
  ): any {
    this.cannotDoInTradeTime();

    return this.fundAccountService.innerTransfer(fund_account, dto);
  }

  @ApiOperation({ operationId: 'externalTransfer' })
  @ApiOkResponse({
    description: 'external transfer',
    type: TransferRecordEntity,
  })
  @Post(':fund_account/@external-transfer')
  externalTransfer(
    @Param('fund_account') fund_account: string,
    @Body() dto: TransferDto
  ): any {
    this.cannotDoInTradeTime();

    return this.fundAccountService.externalTransfer(fund_account, dto);
  }

  /**
   * query fund account from host server
   */
  @ApiOperation({ operationId: 'queryStockAccount' })
  @ApiOkResponse({
    description: 'query fund account from host server',
    type: InnerSnapshotFromServer,
  })
  @Get(':fund_account/@query')
  queryStockAccount(
    @Param('fund_account') fund_account: string,
    @Query() query: QueryStockAccountDto
  ): Promise<InnerSnapshotFromServer> {
    this.cannotDoInTradeTime();

    const { market: marketStr } = query;
    const market = marketStr as Market;

    return this.fundAccountService.queryFundAccount(fund_account, market);
  }

  /**
   * list fund accounts
   */
  @ApiOperation({ operationId: 'listFundAccounts' })
  @ApiOkResponse({
    description: 'list fund accounts',
    type: [FundAccountEntity],
  })
  @Get()
  listFundAccounts(
    @Query() query: ListFundAccountQueryDto
  ): Promise<FundAccountEntity[]> {
    return this.fundAccountService.listStockAccount(query);
  }

  /**
   * list fund snapshots
   */
  @ApiOperation({ operationId: 'listFundSnapshots' })
  @ApiOkResponse({
    description: 'list fund snapshots',
    type: [FundSnapshotEntity],
  })
  @Get(':fund_account/snapshots')
  listFundSnapshots(
    @Param('fund_account') fund_account: string,
    @Query() query: ListFundSnapshotQueryDto
  ): Promise<FundSnapshotEntity[]> {
    return this.fundAccountService.listFundSnapshot(fund_account, query);
  }
}
