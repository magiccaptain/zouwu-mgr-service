import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import { BROKER, BROKER_NAME } from './constants';

class ListBrokerDto {
  @ApiProperty({
    name: 'broker',
    type: 'string',
  })
  broker: string;

  @ApiProperty({
    name: 'name',
    type: 'string',
  })
  name: string;
}

@ApiTags('broker')
@ApiBearerAuth()
@Controller('brokers')
export class BrokerController {
  @ApiOperation({ operationId: 'listBrokers', summary: 'List all available brokers' })
  @ApiOkResponse({ description: 'List of available brokers', type: ListBrokerDto, isArray: true })
  @Get()
  list(): ListBrokerDto[] {
    return Object.keys(BROKER).map((key) => {
      return {
        broker: key,
        name: BROKER_NAME[key],
      };
    });
  }
}
