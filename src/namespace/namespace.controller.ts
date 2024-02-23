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

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespaceQuery } from './dto/list-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('namespaces')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  /**
   * Create namespace
   */
  @ApiOperation({ operationId: 'createNamespace' })
  @ApiCreatedResponse({
    description: 'The namespace has been successfully created.',
    type: Namespace,
  })
  @Post()
  create(@Body() createDto: CreateNamespaceDto) {
    return this.namespaceService.create(createDto);
  }

  /**
   * List namespaces
   */
  @ApiOperation({ operationId: 'listNamespaces' })
  @ApiOkResponse({
    description: 'A paged array of namespaces.',
    type: [Namespace],
  })
  @Get()
  async list(@Query() query: ListNamespaceQuery, @Res() res: Response) {
    const count = await this.namespaceService.count(query);
    const data = await this.namespaceService.list(query);
    res.set({ 'X-Total-Count': count.toString() }).json(data);
    return data;
  }

  /**
   * Find namespace by id or ns
   */
  @ApiOperation({ operationId: 'getNamespace' })
  @ApiOkResponse({
    description: 'The namespace with expected id or ns.',
    type: Namespace,
  })
  @Get(':namespaceIdOrNs')
  async get(@Param('namespaceIdOrNs') namespaceIdOrNs: string) {
    const namespace = await this.namespaceService.get(namespaceIdOrNs);
    if (!namespace)
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${namespaceIdOrNs} not found.`,
        keyPattern: 'namespaceIdOrNs',
        keyValue: { namespaceIdOrNs },
      });
    return namespace;
  }

  /**
   * Update namespace
   */
  @ApiOperation({ operationId: 'updateNamespace' })
  @ApiOkResponse({
    description: 'The namespace updated.',
    type: Namespace,
  })
  @Patch(':namespaceId')
  async update(@Param('namespaceId') namespaceId: string, @Body() updateDto: UpdateNamespaceDto) {
    const namespace = await this.namespaceService.update(namespaceId, updateDto);
    if (!namespace)
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${namespaceId} not found.`,
        keyPattern: 'namespaceId',
        keyValue: { namespaceId },
      });
    return namespace;
  }

  /**
   * Delete namespace
   */
  @ApiOperation({ operationId: 'deleteNamespace' })
  @ApiNoContentResponse({ description: 'No content.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':namespaceId')
  async delete(@Param('namespaceId') namespaceId: string) {
    await this.namespaceService.delete(namespaceId);
  }
}
