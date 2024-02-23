import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { settings } from 'src/config';
import { countTailZero, isNumber } from 'src/lib/lang/number';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUserQuery } from './dto/list-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

function wrapFilter(filter: any) {
  if (filter.district && isNumber(filter.district)) {
    const c = countTailZero(Number(filter.district));
    if (c > 0) {
      filter.district = { $gte: filter.district, $lt: String(Number(filter.district) + 10 ** c) };
    }
  }
  return filter;
}

@Injectable()
export class UserService implements OnModuleInit {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  onModuleInit() {
    this.init().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }

  async init() {
    const initUser = await this.findByLogin(settings.init.user.username);
    if (!initUser) {
      // 用 upsert 防止并发错误
      const userCreated = await this.upsert(settings.init.user);
      // upsert 不会触发 virtual 方法
      userCreated.password = settings.init.user.password;
      await userCreated.save();
    }
  }

  create(createDto: CreateUserDto) {
    const createdUser = new this.userModel(createDto);
    return createdUser.save();
  }

  count(query: ListUserQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.userModel.countDocuments(wrapFilter(filter)).exec();
  }

  list(query: ListUserQuery): Promise<UserDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.userModel.find(wrapFilter(filter)).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsert(user: CreateUserDto) {
    return this.userModel
      .findOneAndUpdate({ username: user.username }, user, { upsert: true, new: true })
      .exec();
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * 获取用户信息
   * @param login username or email
   * @returns
   */
  findByLogin(login: string): Promise<UserDocument> {
    return this.userModel.findOne({ $or: [{ username: login }, { email: login }] }).exec();
  }

  /**
   * 【慎用！！】获取用户信息（包含密码）
   * @param login username or email
   * @returns
   */
  findByLoginWithPassword(login: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ $or: [{ username: login }, { email: login }] })
      .select('_password')
      .exec();
  }
}
