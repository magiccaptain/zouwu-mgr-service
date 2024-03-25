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

import { CreateHostingServerDto } from './dto/create-hosting-server.dto';
import { ListHostingServerQuery } from './dto/list-hosting-server.dto';
import { UpdateHostingServerDto } from './dto/update-hosting-server.dto';
import { HostingServer } from './entities/hosting-server.entity';
import { HostingServerService } from './hosting-server.service';

@ApiTags('HostingServer')
@ApiBearerAuth()
@Controller('hosting-server')
export class HostingServerController {
  constructor(private readonly hostingServerService: HostingServerService) {}

  /**
   * create hosting server
   * @param createDto
   * @returns
   */
  @ApiOperation({ operationId: 'createHostingServer' })
  @ApiCreatedResponse({
    description: 'The hosting server has been successfully created.',
    type: HostingServer,
  })
  @Post()
  create(@Body() createDto: CreateHostingServerDto) {
    return this.hostingServerService.create(createDto);
  }

  /**
   * List hosting servers
   */
  @ApiOperation({ operationId: 'listHostingServers' })
  @ApiOkResponse({
    description: 'The hosting servers have been successfully listed.',
    type: [HostingServer],
  })
  @Get()
  async list(@Query() query: ListHostingServerQuery, @Res() res: Response) {
    const count = await this.hostingServerService.count(query);
    const data = await this.hostingServerService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Get hosting server by id
   */
  @ApiOperation({ operationId: 'getHostingServer' })
  @ApiOkResponse({
    description: 'The hosting server has been successfully retrieved.',
    type: HostingServer,
  })
  @Get(':hostingServerId')
  async get(@Param('hostingServerId') hostingServerId: string) {
    const hostingServer = await this.hostingServerService.get(hostingServerId);
    if (!hostingServer) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `HostingServer with id ${hostingServerId} not found`,
        keyPattern: 'hostingServerId',
        keyValue: { hostingServerId },
      });
    }

    return hostingServer;
  }

  /**
   * update hosting server by id
   */
  @ApiOperation({ operationId: 'updateHostingServer' })
  @ApiOkResponse({
    description: 'The hosting server has been successfully updated.',
    type: HostingServer,
  })
  @Patch(':hostingServerId')
  async update(
    @Param('hostingServerId') hostingServerId: string,
    @Body() updateDto: UpdateHostingServerDto
  ) {
    const hostingServer = await this.hostingServerService.update(
      hostingServerId,
      updateDto
    );
    if (!hostingServer) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `HostingServer with id ${hostingServerId} not found`,
        keyPattern: 'hostingServerId',
        keyValue: { hostingServerId },
      });
    }
    return hostingServer;
  }

  /**
   * delete hosting server by id
   */
  @ApiOperation({ operationId: 'deleteHostingServer' })
  @ApiNoContentResponse({
    description: 'The hosting server has been successfully deleted.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':hostingServerId')
  async delete(@Param('hostingServerId') hostingServerId: string) {
    await this.hostingServerService.delete(hostingServerId);
  }

  /**
   * check hosting server
   */
  @ApiOperation({ operationId: 'checkHostingServer' })
  @ApiOkResponse({
    description: 'The hosting server has been successfully checked.',
    type: HostingServer,
  })
  @HttpCode(HttpStatus.OK)
  @Post(':hostingServerId/@check')
  async check(@Param('hostingServerId') hostingServerId: string) {
    const hostingServer = await this.hostingServerService.check(
      hostingServerId
    );

    if (!hostingServer) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: `HostingServer with id ${hostingServerId} not found`,
        keyPattern: 'hostingServerId',
        keyValue: { hostingServerId },
      });
    }

    return hostingServer;
  }
}
