import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  count(query: ListProductQuery) {
    const { filter } = buildMongooseQuery(query);
    return this.productModel.countDocuments(filter);
  }

  list(query: ListProductQuery) {
    const { limit, sort, offset, filter } = buildMongooseQuery(query);
    return this.productModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string) {
    return this.productModel.findById(id).exec();
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, {
        new: true,
      })
      .exec();
  }

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
