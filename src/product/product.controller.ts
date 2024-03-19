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

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * create fund account
   */
  @ApiOperation({
    operationId: 'createProduct',
    summary: 'Create a fund account',
  })
  @ApiCreatedResponse({
    description: 'Fund account created successfully',
    type: Product,
  })
  @Post()
  async create(@Body() createDto: CreateProductDto) {
    return this.productService.create(createDto);
  }

  /**
   * List fund accounts
   */
  @ApiOperation({
    operationId: 'listProducts',
    summary: 'List fund accounts',
  })
  @ApiOkResponse({
    description: 'Fund accounts listed successfully',
    type: [Product],
  })
  @Get()
  async list(@Query() query: ListProductQuery, @Res() res: Response) {
    const count = await this.productService.count(query);
    const data = await this.productService.list(query);
    res.set('X-Total-Count', count.toString()).json(data);
    return data;
  }

  /**
   * Get fund account by id
   */
  @ApiOperation({
    operationId: 'getProductById',
    summary: 'Get fund account by id',
  })
  @ApiOkResponse({
    description: 'Fund account found successfully',
    type: Product,
  })
  @Get(':productId')
  async get(@Param('productId') productId: string) {
    const product = await this.productService.get(productId);
    if (!product) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Fund account not found',
        keyPattern: 'productId',
        keyValue: productId,
      });
    }
    return product;
  }

  /**
   * Update fund account by id
   */
  @ApiOperation({
    operationId: 'updateProductById',
    summary: 'Update fund account by id',
  })
  @ApiOkResponse({
    description: 'Fund account updated successfully',
    type: Product,
  })
  @Patch(':productId')
  async update(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateProductDto
  ) {
    const product = await this.productService.update(productId, updateDto);
    if (!product) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Fund account not found',
        keyPattern: 'productId',
        keyValue: productId,
      });
    }
    return product;
  }

  /**
   * delete fund account by id
   */
  @ApiOperation({
    operationId: 'deleteProductById',
    summary: 'Delete fund account by id',
  })
  @ApiNoContentResponse({
    description: 'Fund account deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':productId')
  async delete(@Param('productId') productId: string) {
    await this.productService.delete(productId);
  }
}
