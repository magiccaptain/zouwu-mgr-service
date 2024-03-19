import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateFundAccountDto } from './dto/create-fund-account.dto';
import { ListFundAccountQuery } from './dto/list-fund-account.dto';
import { UpdateFundAccountDto } from './dto/update-fund-account.dto';
import {
  FundAccount,
  FundAccountDocument,
} from './entities/fund-account.entity';

@Injectable()
export class FundAccountService {
  constructor(
    @InjectModel(FundAccount.name)
    private readonly fundAccountModel: Model<FundAccountDocument>
  ) {}

  create(createFundAccountDto: CreateFundAccountDto) {
    const fundAccount = new this.fundAccountModel(createFundAccountDto);
    return fundAccount.save();
  }

  count(query: ListFundAccountQuery) {
    const { filter } = buildMongooseQuery(query);
    return this.fundAccountModel.countDocuments(filter);
  }

  list(query: ListFundAccountQuery) {
    const { limit, sort, offset, filter } = buildMongooseQuery(query);
    return this.fundAccountModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string) {
    return this.fundAccountModel.findById(id).exec();
  }

  update(id: string, updateFundAccountDto: UpdateFundAccountDto) {
    return this.fundAccountModel
      .findByIdAndUpdate(id, updateFundAccountDto, {
        new: true,
      })
      .exec();
  }

  delete(id: string) {
    return this.fundAccountModel.findByIdAndDelete(id).exec();
  }
}
