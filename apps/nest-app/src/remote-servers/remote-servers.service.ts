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

  
  create(props: CreateRemoteServerDto & {ownerId: string}) {
    const remoteServer = this.repo.create({
      ...props,
      status: RemoteServerStatus.UNKNOWN
    });
    console.log(remoteServer);
    return this.repo.save(remoteServer);
  }

  async getById(id: number, ownerId: string) {
    const server = await this.repo.findOne({
      where: {id: String(id), ownerId}
    });

    if(!server) {
      throw new NotFoundException(`Remote server with ID "${id}" not found !`);
    }

    return server;
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string, ownerId: string) {
    return this.repo.findOne({where: {id: String(id), ownerId}});
  }

  async update(id: string, updateRemoteServerDto: UpdateRemoteServerDto, ownerId: string) {
    const server = await this.repo.findOne({where: {id: String(id), ownerId}});

    if(!server) {
      throw new NotFoundException(`Remote server with ID "${id}" not found !`);
    }

    this.repo.merge(server, updateRemoteServerDto);
    return this.repo.save(server);
  }

  async remove(id: string, ownerId: string) {
    const server = await this.repo.findOne({where: {id: String(id), ownerId}});

    if(!server) {
      throw new NotFoundException(`Remote server with ID "${id}" not found !`);
    }
    
    return this.repo.remove(server);
  }
}
