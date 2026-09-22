import { Injectable } from '@nestjs/common';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto.js';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto.js';

@Injectable()
export class RemoteServersService {
  create(createRemoteServerDto: CreateRemoteServerDto) {
    return 'This action adds a new remoteServer';
  }

  findAll() {
    return `This action returns all remoteServers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} remoteServer`;
  }

  update(id: number, updateRemoteServerDto: UpdateRemoteServerDto) {
    return `This action updates a #${id} remoteServer`;
  }

  remove(id: number) {
    return `This action removes a #${id} remoteServer`;
  }
}
