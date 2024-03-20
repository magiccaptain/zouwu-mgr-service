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
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { errCodes } from 'src/common';

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Product,
  PRODUCT_TYPE,
  PRODUCT_TYPE_I18N,
} from './entities/product.entity';
import { ProductService } from './product.service';

class ListProductTypeDto {
  @ApiProperty({
    name: 'type',
    type: 'string',
  })
  type: string;

  @ApiProperty({
    name: 'name',
    type: 'string',
  })
  name: string;
}

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * create product
   */
  @ApiOperation({
    operationId: 'createProduct',
    summary: 'Create a product',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: Product,
  })
  @Post()
  async create(@Body() createDto: CreateProductDto) {
    return this.productService.create(createDto);
  }

  /**
   * List products
   */
  @ApiOperation({
    operationId: 'listProducts',
    summary: 'List products',
  })
  @ApiOkResponse({
    description: 'Products listed successfully',
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
   * Get product by id
   */
  @ApiOperation({
    operationId: 'getProductById',
    summary: 'Get product by id',
  })
  @ApiOkResponse({
    description: 'Product found successfully',
    type: Product,
  })
  @Get(':productId')
  async get(@Param('productId') productId: string) {
    const product = await this.productService.get(productId);
    if (!product) {
      throw new NotFoundException({
        code: errCodes.NOT_FOUND,
        message: 'Product not found',
        keyPattern: 'productId',
        keyValue: productId,
      });
    }
    return product;
  }

  /**
   * Update product by id
   */
  @ApiOperation({
    operationId: 'updateProductById',
    summary: 'Update product by id',
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
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
        message: 'Product not found',
        keyPattern: 'productId',
        keyValue: productId,
      });
    }
    return product;
  }

  /**
   * delete product by id
   */
  @ApiOperation({
    operationId: 'deleteProductById',
    summary: 'Delete product by id',
  })
  @ApiNoContentResponse({
    description: 'Product deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':productId')
  async delete(@Param('productId') productId: string) {
    await this.productService.delete(productId);
  }

  /**
   * 获取product 类型列表
   */
  @ApiOperation({
    operationId: 'listProductTypes',
    summary: 'List all available product types',
  })
  @ApiOkResponse({
    description: 'List of available product types',
    type: ListProductTypeDto,
    isArray: true,
  })
  @Get('/product-types')
  listTypes(): ListProductTypeDto[] {
    return Object.values(PRODUCT_TYPE).map((type) => ({
      type,
      name: PRODUCT_TYPE_I18N[type],
    }));
  }
}
