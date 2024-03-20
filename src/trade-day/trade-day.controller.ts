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

import { CreateTradeDayDto } from './dto/create-trade-day.dto';
import { ListTradeDayQuery } from './dto/list-trade-day.dto';
import { TradeDay } from './entities/trade-day.entity';
import { TradeDayService } from './trade-day.service';

@ApiTags('TradeDay')
@ApiBearerAuth()
@Controller('tradeday')
export class TradeDayController {
  constructor(private readonly tradedayService: TradeDayService) {}

  /**
   * create trade day
   */
  @ApiOperation({
    operationId: 'createTradeDay',
    summary: 'Create a trade day',
  })
  @ApiCreatedResponse({
    description: 'Trade day created successfully',
    type: TradeDay,
  })
  @Post()
  async create(@Body() createDto: CreateTradeDayDto) {
    return this.tradedayService.create(createDto);
  }

  /**
   * List trade days
   */
  @ApiOperation({
    operationId: 'listTradeDays',
    summary: 'List trade days',
  })
  @ApiOkResponse({
    description: 'Trade days listed successfully',
    type: [TradeDay],
  })
  @Get()
  async list(@Query() query: ListTradeDayQuery, @Res() res: Response) {
    const count = await this.tradedayService.count(query);
    const data = await this.tradedayService.list(query);
    res.set('X-Total-Count', count.toString()).json(data);
    return data;
  }

  /**
   * Get trade day by id
   */
  @ApiOperation({
    operationId: 'getTradeDayById',
    summary: 'Get trade day by id',
  })
  @ApiOkResponse({
    description: 'Trade day found successfully',
    type: TradeDay,
  })
  @Get(':tradedayId')
  async get(@Param('tradedayId') tradedayId: string) {
    const tradeday = await this.tradedayService.get(tradedayId);
    if (!tradeday) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Trade day not found',
        keyPattern: 'tradedayId',
        keyValue: tradedayId,
      });
    }
    return tradeday;
  }

  /**
   * delete trade day by id
   */
  @ApiOperation({
    operationId: 'deleteTradeDayById',
    summary: 'Delete trade day by id',
  })
  @ApiNoContentResponse({
    description: 'Trade day deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':tradedayId')
  async delete(@Param('tradedayId') tradedayId: string) {
    await this.tradedayService.delete(tradedayId);
  }
}
