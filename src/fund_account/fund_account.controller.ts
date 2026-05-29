import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import dayjs from 'dayjs';

import { settings } from 'src/config';

import {
  ConfirmCompletionDto,
  CreateSubscriptionRedemptionDto,
  FundAccountEntity,
  FundSnapshotEntity,
  InnerSnapshotFromServer,
  ListFundAccountQueryDto,
  ListFundSnapshotQueryDto,
  NextTradingDayEntity,
  QueryNextTradingDayDto,
  QueryStockAccountDto,
  RefreshFundsEntity,
  TransferDto,
  TransferRecordEntity,
  UpdateSubscriptionRedemptionDto,
} from './fund_account.dto';
import { FundAccountService } from './fund_account.service';

@Controller('fund-account')
export class FundAccountController {
  constructor(private readonly fundAccountService: FundAccountService) {}

  @ApiOperation({ operationId: 'queryNextTradingDay' })
  @ApiOkResponse({
    description: 'query next trading day',
    type: NextTradingDayEntity,
  })
  @Get('@next-trading-day')
  async queryNextTradingDay(
    @Query() query: QueryNextTradingDayDto
  ): Promise<NextTradingDayEntity> {
    return {
      next_trading_day: await this.fundAccountService.getNextTradingDay(
        query.base_date
      ),
    };
  }

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

  @ApiOperation({ operationId: 'refreshFunds' })
  @ApiOkResponse({
    description: 'refresh funds and return balance comparison',
    type: RefreshFundsEntity,
  })
  @Post(':fund_account/@refresh-funds')
  refreshFunds(
    @Param('fund_account') fund_account: string
  ): Promise<RefreshFundsEntity> {
    return this.fundAccountService.refreshFunds(fund_account);
  }

  @ApiOperation({ operationId: 'createSubscriptionRedemption' })
  @Post('subscription-redemption')
  createSubscriptionRedemption(
    @Body() dto: CreateSubscriptionRedemptionDto
  ): any {
    return this.fundAccountService.createSubscriptionRedemption(dto);
  }

  @ApiOperation({ operationId: 'confirmSubscriptionRedemption' })
  @Post('subscription-redemption/@confirm')
  confirmSubscriptionRedemption(@Body() dto: ConfirmCompletionDto): any {
    return this.fundAccountService.confirmSubscriptionRedemption(dto);
  }

  @ApiOperation({ operationId: 'updateSubscriptionRedemption' })
  @Patch('subscription-redemption/:id')
  updateSubscriptionRedemption(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionRedemptionDto
  ): any {
    return this.fundAccountService.updateSubscriptionRedemption(id, dto);
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
