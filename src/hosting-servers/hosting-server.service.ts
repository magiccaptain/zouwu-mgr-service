import path from 'path';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSSH, SSHExecCommandOptions } from 'node-ssh';

import { settings } from 'src/config';
import { buildMongooseQuery } from 'src/lib/mongoose-helper';
import { ssh2Exec } from 'src/lib/ssh2';

import { CreateHostingServerDto } from './dto/create-hosting-server.dto';
import { ListHostingServerQuery } from './dto/list-hosting-server.dto';
import { UpdateHostingServerDto } from './dto/update-hosting-server.dto';
import {
  HostingServer,
  HostingServerDocument,
} from './entities/hosting-server.entity';

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
    return this.hostingServerModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  get(id: string): Promise<HostingServerDocument> {
    return this.hostingServerModel.findById(id).exec();
  }

  update(
    id: string,
    updateDto: UpdateHostingServerDto
  ): Promise<HostingServerDocument> {
    return this.hostingServerModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  delete(id: string) {
    return this.hostingServerModel.findByIdAndDelete(id).exec();
  }

  /**
   *  检查服务器连通性及磁盘情况
   * @param id
   * @returns
   */
  async check(id: string) {
    const hostingServer = await this.get(id);

    if (!hostingServer) return null;

    const tools_dir = path.join(hostingServer.home_dir, 'zhisui_tools');

    try {
      const ret = await ssh2Exec(
        {
          host: hostingServer.ssh_host,
          port: hostingServer.ssh_port,
          username: hostingServer.ssh_user,
        },
        `./gom ${hostingServer.home_dir}`,
        {
          cwd: tools_dir,
        }
      );

      if (ret.code !== 0) {
        hostingServer.connect_status = false;
      } else {
        const info = JSON.parse(ret.stdout);

        const { disk_total, disk_free } = info;

        hostingServer.disk_total = disk_total;
        hostingServer.disk_free = disk_free;
        hostingServer.connect_status = true;
      }
    } catch (error) {
      hostingServer.connect_status = false;
      console.log(error);
    } finally {
      hostingServer.last_check_at = new Date();
      return await hostingServer.save();
    }
  }
}
