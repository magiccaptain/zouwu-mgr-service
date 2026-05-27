import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import {
  CandidatesQueryDto,
  CreateCustodianTransferDto,
  CustodianTransferEntity,
  ListCustodianTransferQueryDto,
  UpdateCustodianTransferDto,
} from './custodian_transfer.dto';
import { CustodianTransferService } from './custodian_transfer.service';

@Controller('custodian-transfer')
export class CustodianTransferController {
  constructor(
    private readonly custodianTransferService: CustodianTransferService
  ) {}

  @ApiOperation({ operationId: 'createCustodianTransfer' })
  @ApiOkResponse({
    description: 'create custodian transfer',
    type: CustodianTransferEntity,
  })
  @Post()
  create(@Body() dto: CreateCustodianTransferDto) {
    return this.custodianTransferService.create(dto);
  }

  @ApiOperation({ operationId: 'listCustodianTransfers' })
  @ApiOkResponse({
    description: 'list custodian transfers',
    type: [CustodianTransferEntity],
  })
  @Get()
  findAll(@Query() query: ListCustodianTransferQueryDto) {
    return this.custodianTransferService.findAll(query);
  }

  @ApiOperation({ operationId: 'findCustodianTransferCandidates' })
  @Get('candidates')
  findCandidates(@Query() query: CandidatesQueryDto) {
    return this.custodianTransferService.findCandidates(query);
  }

  @ApiOperation({ operationId: 'updateCustodianTransfer' })
  @ApiOkResponse({
    description: 'update custodian transfer',
    type: CustodianTransferEntity,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustodianTransferDto) {
    return this.custodianTransferService.update(Number(id), dto);
  }

  @ApiOperation({ operationId: 'removeCustodianTransfer' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.custodianTransferService.remove(Number(id));
  }
}
