import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import {
  SyncResultEntity,
  SyncTradingCalendarDto,
  TradingCalendarEntity,
  UpdateTradingCalendarDto,
} from './trading-calendar.dto';
import { TradingCalendarService } from './trading-calendar.service';

@Controller('trading-calendar')
export class TradingCalendarController {
  constructor(
    private readonly tradingCalendarService: TradingCalendarService
  ) {}

  @ApiOperation({ operationId: 'queryTradingCalendar' })
  @ApiOkResponse({
    description: 'query full year trading calendar',
    type: [TradingCalendarEntity],
  })
  @Get()
  async queryByYear(
    @Query('year', ParseIntPipe) year: number
  ): Promise<TradingCalendarEntity[]> {
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Invalid year format');
    }

    return this.tradingCalendarService.getByYear(year);
  }

  @ApiOperation({ operationId: 'syncTradingCalendar' })
  @ApiOkResponse({
    description: 'sync trading calendar from python service',
    type: SyncResultEntity,
  })
  @Post('sync')
  async sync(@Body() dto: SyncTradingCalendarDto): Promise<SyncResultEntity> {
    const currentYear = new Date().getFullYear();
    const startYear = dto.start_year ?? currentYear - 5;
    const endYear = dto.end_year ?? currentYear;

    return this.tradingCalendarService.sync(startYear, endYear);
  }

  @ApiOperation({ operationId: 'updateTradingCalendar' })
  @ApiOkResponse({
    description: 'update a single trading calendar entry',
    type: TradingCalendarEntity,
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTradingCalendarDto
  ): Promise<TradingCalendarEntity> {
    const existing = await this.tradingCalendarService.findById(id);

    if (!existing) {
      throw new NotFoundException(`TradingCalendar with id ${id} not found`);
    }

    return this.tradingCalendarService.update(id, dto.is_open);
  }
}
