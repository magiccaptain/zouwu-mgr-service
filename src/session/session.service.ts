import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { splitShortTimeSpan } from 'src/lib/lang/time';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionQuery } from './dto/list-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>
  ) {}

  create(createDto: CreateSessionDto) {
    const key = nanoid();
    const session = new this.sessionModel({ ...createDto, key });
    return session.save();
  }

  count(query: ListSessionQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.sessionModel.countDocuments(filter).exec();
  }

  list(query: ListSessionQuery) {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.sessionModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string): Promise<SessionDocument> {
    return this.sessionModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateSessionDto): Promise<SessionDocument> {
    return this.sessionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async delete(id: string) {
    await this.sessionModel.findByIdAndDelete(id).exec();
  }

  async findByKey(key: string): Promise<SessionDocument> {
    return this.sessionModel.findOne({ key }).exec();
  }

  /**
   * 根据 key 找到 session
   *
   * @param key
   * @returns
   */
  async findAndMaybeRefreshKey(
    key: string,
    refreshBefore = '1d'
  ): Promise<SessionDocument> {
    const session = await this.sessionModel.findOne({ key }).exec();
    if (!session) {
      return null;
    }

    const [span, unit] = splitShortTimeSpan(refreshBefore);

    if (dayjs(session.expireAt).isBefore(dayjs().add(span, unit))) {
      session.key = nanoid();
      await session.save();
    }

    return session;
  }
}
