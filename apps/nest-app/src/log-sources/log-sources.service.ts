import { Injectable } from '@nestjs/common';
import { CreateLogSourceDto } from './dto/create-log-source.dto.js';
import { UpdateLogSourceDto } from './dto/update-log-source.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogSource, LogSourceStatus } from './entities/log-source.entity.js';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class LogSourcesService {

  constructor (
    @InjectRepository(LogSource)
    private repo: Repository<LogSource>
  ) {}

  async create(props:  CreateLogSourceDto, ownerId: string) {
    const source = this.repo.create({
      ...props,
      ownerId,
      status: LogSourceStatus.UNKNOWN
    })
    return await this.repo.save(source)
  }

  async findAll(ownerId: string) {
    return await this.repo.find()
  }

  async findOne(id: string, ownerId: string) {
    const source = await this.repo.findOne({where: {id, ownerId}})
    if (!source) throw new NotFoundException()
    return source;
  }

  async getById(id: string, ownerId: string){
    const source = await this.repo.findOneBy({id, ownerId});
    if (!source) throw new NotFoundException()
    return source;
  }

  async update(id: string, props:  UpdateLogSourceDto, ownerId: string) {
    const source = await this.findOne(id, ownerId)
    Object.assign(source, props)
    return await this.repo.save(source) 
  }

  async remove(id: string, ownerId: string) {
    const source = await this.getById(id, ownerId)
    await this.repo.remove(source)
  }
}
