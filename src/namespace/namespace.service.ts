import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';

import { settings } from 'src/config';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { ListNamespaceQuery } from './dto/list-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';
import { Namespace, NamespaceDocument } from './entities/namespace.entity';

@Injectable()
export class NamespaceService implements OnModuleInit {
  constructor(
    @InjectModel(Namespace.name) private readonly namespaceModel: Model<NamespaceDocument>
  ) {}
  onModuleInit() {
    this.init().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }

  async init() {
    const initNamespace = await this.get(settings.init.namespace.ns);
    if (!initNamespace) {
      // 用 upsert 防止并发错误
      await this.upsert(settings.init.namespace);
    }
  }

  create(createDto: CreateNamespaceDto) {
    const createdNamespace = new this.namespaceModel(createDto);
    return createdNamespace.save();
  }

  count(query: ListNamespaceQuery): Promise<number> {
    const { filter } = buildMongooseQuery(query);
    return this.namespaceModel.countDocuments(filter).exec();
  }

  list(query: ListNamespaceQuery): Promise<NamespaceDocument[]> {
    const { limit = 10, sort, offset = 0, filter } = buildMongooseQuery(query);
    return this.namespaceModel.find(filter).sort(sort).skip(offset).limit(limit).exec();
  }

  get(idOrNs: string): Promise<NamespaceDocument> {
    const filter = isObjectIdOrHexString(idOrNs) ? { _id: idOrNs } : { ns: idOrNs };
    return this.namespaceModel.findOne(filter).exec();
  }

  update(id: string, updateDto: UpdateNamespaceDto): Promise<NamespaceDocument> {
    return this.namespaceModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  upsert(namespace: CreateNamespaceDto) {
    return this.namespaceModel
      .findOneAndUpdate({ ns: namespace.ns }, namespace, { upsert: true, new: true })
      .exec();
  }

  delete(id: string) {
    return this.namespaceModel.findByIdAndDelete(id).exec();
  }
}
