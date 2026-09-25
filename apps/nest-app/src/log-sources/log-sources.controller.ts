import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogSourcesService } from './log-sources.service.js';
import { CreateLogSourceDto } from './dto/create-log-source.dto.js';
import { UpdateLogSourceDto } from './dto/update-log-source.dto.js';
import type { ICurrentUser } from '../auth/current-user.interface.js';
import { CurrentUser } from '../auth/current-auth.decorator.js';

@Controller('log-sources')
export class LogSourcesController {
  constructor(private readonly logSourcesService: LogSourcesService) {}

  @Post()
  create(
    @Body() props: CreateLogSourceDto, 
    @CurrentUser() currentUser: ICurrentUser  
  ) {
    return this.logSourcesService.create(props, currentUser.id);
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogSourceDto: UpdateLogSourceDto, @CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.update(id, updateLogSourceDto, currentUser.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logSourcesService.remove(id, currentUser.id);
  }
}
