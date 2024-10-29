import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Market } from '@prisma/client';

import {
  FundAccountEntity,
  InnerSnapshotFromServer,
  ListFundAccountQueryDto,
  QueryStockAccountFromServerDto,
  TransferDto,
  TransferRecordEntity,
} from './fund_account.dto';
import { FundAccountService } from './fund_account.service';

@Controller('fund-account')
export class FundAccountController {
  constructor(private readonly fundAccountService: FundAccountService) {}

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
    return this.fundAccountService.externalTransfer(fund_account, dto);
  }

  /**
   * query fund account from host server
   */
  @ApiOperation({ operationId: 'queryStockAccountFromHostServer' })
  @ApiOkResponse({
    description: 'query fund account from host server',
    type: InnerSnapshotFromServer,
  })
  @Get(':fund_account/@query')
  queryStockAccountFromHostServer(
    @Param('fund_account') fund_account: string,
    @Query() query: QueryStockAccountFromServerDto
  ): Promise<InnerSnapshotFromServer> {
    const { market: marketStr } = query;
    const market = marketStr as Market;

    return this.fundAccountService.queryStockAccountFromHostServer(
      fund_account,
      market
    );
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
}
