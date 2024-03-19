import { OmitType } from '@nestjs/swagger';

import { ProductDoc } from '../entities/product.entity';

export class CreateProductDto extends OmitType(ProductDoc, [] as const) {}
