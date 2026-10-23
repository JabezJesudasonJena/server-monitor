import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto.js';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoteServer, RemoteServerStatus } from './entities/remote-server.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServer)
    private repo: Repository<RemoteServer>,
  ) {}

  create(props: CreateRemoteServerDto , ownerId: string) {
    return this.repo.save({
      ...props,
      ownerId
    });
  }

  findAll(ownerId: string) : Promise<RemoteServer[]>{
    return this.repo.find({where: {ownerId}});
  }

  findOne(id: string, ownerId: string) : Promise<RemoteServer>{
    return this.repo.findOneByOrFail({id, ownerId})
  }

  async update(id: string, updateRemoteServerDto: UpdateRemoteServerDto, ownerId: string) {
    return this.repo.update({id, ownerId}, updateRemoteServerDto);
  }

  async remove(id: string, ownerId: string) {
    return this.repo.delete({id, ownerId})
  }
}
