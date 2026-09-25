import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service.js';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto.js';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto.js';
import { CurrentUser } from '../auth/current-auth.decorator.js';
import type { ICurrentUser } from '../auth/current-user.interface.js';

@Controller('remote-servers')
export class RemoteServersController {
  constructor(private readonly remoteServersService: RemoteServersService) {}

  @Post()
  create(
    @Body() props: CreateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return this.remoteServersService.create(props, currentUser.id);
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.remoteServersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    // return 'finds all user'
    return this.remoteServersService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRemoteServerDto: UpdateRemoteServerDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.remoteServersService.update(id, updateRemoteServerDto, currentUser.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.remoteServersService.remove(id, currentUser.id);
  }
}
