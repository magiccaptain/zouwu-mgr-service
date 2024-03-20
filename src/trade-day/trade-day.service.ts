import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateTradeDayDto } from './dto/create-trade-day.dto';
import { ListTradeDayQuery } from './dto/list-trade-day.dto';
import { TradeDay, TradeDayDocument } from './entities/trade-day.entity';

@Injectable()
export class TradeDayService {
  constructor(
    @InjectModel(TradeDay.name)
    private readonly tradedayModel: Model<TradeDayDocument>
  ) {}

  create(createTradeDayDto: CreateTradeDayDto) {
    const tradeday = new this.tradedayModel(createTradeDayDto);
    return tradeday.save();
  }

  count(query: ListTradeDayQuery) {
    const { filter } = buildMongooseQuery(query);
    return this.tradedayModel.countDocuments(filter);
  }

  list(query: ListTradeDayQuery) {
    const { limit, sort, offset, filter } = buildMongooseQuery(query);
    return this.tradedayModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string) {
    return this.tradedayModel.findById(id).exec();
  }

  delete(id: string) {
    return this.tradedayModel.findByIdAndDelete(id).exec();
  }
}
