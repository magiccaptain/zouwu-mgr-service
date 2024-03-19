import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { errCodes } from 'src/common';

import { CreateFundAccountDto } from './dto/create-fund-account.dto';
import { ListFundAccountQuery } from './dto/list-fund-account.dto';
import { UpdateFundAccountDto } from './dto/update-fund-account.dto';
import { FundAccount } from './entities/fund-account.entity';
import { FundAccountService } from './fund-account.service';

@ApiTags('FundAccount')
@ApiBearerAuth()
@Controller('fund-account')
export class FundAccountController {
  constructor(private readonly fundAccountService: FundAccountService) {}

  /**
   * create fund account
   */
  @ApiOperation({
    operationId: 'createFundAccount',
    summary: 'Create a fund account',
  })
  @ApiCreatedResponse({
    description: 'Fund account created successfully',
    type: FundAccount,
  })
  @Post()
  async create(@Body() createDto: CreateFundAccountDto) {
    return this.fundAccountService.create(createDto);
  }

  /**
   * List fund accounts
   */
  @ApiOperation({
    operationId: 'listFundAccounts',
    summary: 'List fund accounts',
  })
  @ApiOkResponse({
    description: 'Fund accounts listed successfully',
    type: [FundAccount],
  })
  @Get()
  async list(@Query() query: ListFundAccountQuery, @Res() res: Response) {
    const count = await this.fundAccountService.count(query);
    const data = await this.fundAccountService.list(query);
    res.set('X-Total-Count', count.toString()).json(data);
    return data;
  }

  /**
   * Get fund account by id
   */
  @ApiOperation({
    operationId: 'getFundAccountById',
    summary: 'Get fund account by id',
  })
  @ApiOkResponse({
    description: 'Fund account found successfully',
    type: FundAccount,
  })
  @Get(':fundAccountId')
  async get(@Param('fundAccountId') fundAccountId: string) {
    const fundAccount = await this.fundAccountService.get(fundAccountId);
    if (!fundAccount) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Fund account not found',
        keyPattern: 'fundAccountId',
        keyValue: fundAccountId,
      });
    }
    return fundAccount;
  }

  /**
   * Update fund account by id
   */
  @ApiOperation({
    operationId: 'updateFundAccountById',
    summary: 'Update fund account by id',
  })
  @ApiOkResponse({
    description: 'Fund account updated successfully',
    type: FundAccount,
  })
  @Patch(':fundAccountId')
  async update(
    @Param('fundAccountId') fundAccountId: string,
    @Body() updateDto: UpdateFundAccountDto
  ) {
    const fundAccount = await this.fundAccountService.update(
      fundAccountId,
      updateDto
    );
    if (!fundAccount) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Fund account not found',
        keyPattern: 'fundAccountId',
        keyValue: fundAccountId,
      });
    }
    return fundAccount;
  }

  /**
   * delete fund account by id
   */
  @ApiOperation({
    operationId: 'deleteFundAccountById',
    summary: 'Delete fund account by id',
  })
  @ApiNoContentResponse({
    description: 'Fund account deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':fundAccountId')
  async delete(@Param('fundAccountId') fundAccountId: string) {
    await this.fundAccountService.delete(fundAccountId);
  }
}
