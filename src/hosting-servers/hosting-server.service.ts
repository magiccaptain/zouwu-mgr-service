import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateHostingServerDto } from './dto/create-hosting-server.dto';
import { ListHostingServerQuery } from './dto/list-hosting-server.dto';
import { UpdateHostingServerDto } from './dto/update-hosting-server.dto';
import { HostingServer, HostingServerDocument } from './entities/hosting-server.entity';

@Injectable()
export class HostingServerService {
  constructor(
    @InjectModel(HostingServer.name)
    private readonly hostingServerModel: Model<HostingServerDocument>
  ) {}

  create(createDto: CreateHostingServerDto) {
    const createdHostingServer = new this.hostingServerModel(createDto);
    return createdHostingServer.save();
  }

  count(query: ListHostingServerQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.hostingServerModel.countDocuments(filter);
  }

  list(query: ListHostingServerQuery): Promise<HostingServerDocument[]> {
    const { limit, sort, offset, filter } = buildMongooseQuery(query);
    return this.hostingServerModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(id: string): Promise<HostingServerDocument> {
    return this.hostingServerModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateHostingServerDto): Promise<HostingServerDocument> {
    return this.hostingServerModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  delete(id: string) {
    return this.hostingServerModel.findByIdAndDelete(id).exec();
  }
}
