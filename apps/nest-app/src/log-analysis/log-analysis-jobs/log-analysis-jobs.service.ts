import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto.js';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto.js';
import { Repository } from 'typeorm';
import { LogAnalysisJob, LogAnalysisJobStatus } from './entities/log-analysis-job.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { LogSourcesService } from '../../log-sources/log-sources.service.js';
import { RemoteServersService } from '../../remote-servers/remote-servers.service.js';

@Injectable()
export class LogAnalysisJobsService {

  constructor (
    @InjectRepository(LogAnalysisJob)
    private repo: Repository<LogAnalysisJob>,
    private logSourcesService: LogSourcesService,
    private remoteServersService: RemoteServersService
  ) {}

  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
    const logSource = await this.logSourcesService.getById(props.logSourceId, ownerId);
    const remoteServer = await this.remoteServersService.getById(props.remoteServerId, ownerId);
    
    if(!logSource || !remoteServer) {
      throw new NotFoundException('Log Source or Remote Server not found!');
    }

    const logAnalysisJob = this.repo.create({
      ...props,
      ownerId,
      logSource,
      remoteServer,
      status: LogAnalysisJobStatus.INITIALIZED
    })

    return this.repo.save(logAnalysisJob)

  }

  async findAll(ownerId: string) {
    return this.repo.find({where: {ownerId}});
  }

  async findOne(id: string, ownerId: string) {
    const exist = await this.repo.findOneBy({id, ownerId});
    if (!exist) throw new NotFoundException('Log analysis job not found');
    return exist;
  }

  async getbyId(id:string , ownerId: string){
    const job = await this.repo.findOneBy({id, ownerId});
    if (!job) throw new NotFoundException('Log analysis job not found');
    return job;
  }

  async update(id: string, updateLogAnalysisJobDto: UpdateLogAnalysisJobDto, ownerId: string) {
    const exist = await this.getbyId(id, ownerId);
    if (!exist) throw new NotFoundException('Log analysis job not found');
    return this.repo.save({...exist, ...updateLogAnalysisJobDto});
  } 

  async remove(id: string, ownerId: string) {
    const exist = await this.findOne(id, ownerId);
    if (!exist) throw new NotFoundException('Log analysis job not found');
    return this.repo.remove(exist);
  }
}
