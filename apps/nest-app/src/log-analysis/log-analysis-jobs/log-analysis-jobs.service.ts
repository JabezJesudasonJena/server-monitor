import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto.js';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto.js';
import { Repository, In } from 'typeorm';
import { LogAnalysisJob, LogAnalysisJobStatus } from './entities/log-analysis-job.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { LogSourcesService } from '../../log-sources/log-sources.service.js';
import { RemoteServersService } from '../../remote-servers/remote-servers.service.js';
import { Anomaly, AnomalySeverity, AnomalyStatus } from './entities/anomaly.entity.js';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { AnomalyCreatedEvent } from '../../shared/events/anomaly.event.js'

@Injectable()
export class LogAnalysisJobsService {

  constructor (
    @InjectRepository(LogAnalysisJob)
    private repo: Repository<LogAnalysisJob>,
    private logSourcesService: LogSourcesService,
    private remoteServersService: RemoteServersService,
    @InjectRepository(Anomaly)
    private anomalyRepo: Repository<Anomaly>,
    private eventEmitter: EventEmitter
  ) {}

  async getAnomaly(id: string) {
    return this.anomalyRepo.findOneBy({id});
  }

  async getTicketingSystemConfig(jobId: string) {
    const job = await this.repo.findOne({
      where: {id: jobId},
      select: {
        ticketingSystemConfig: true
      }
    })

    if(!job) throw new NotFoundException('Log analysis job not found');
    
    return job.ticketingSystemConfig;
  }

  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
    const logSource = props.logSourceId
      ? await this.logSourcesService.getById(props.logSourceId, ownerId)
      : null;
    const remoteServer = await this.remoteServersService.getById(props.remoteServerId, ownerId);
    
    if ((props.logSourceId && !logSource) || !remoteServer) {
      throw new NotFoundException('Log Source or Remote Server not found!');
    }

    const logAnalysisJob = this.repo.create({
      ...props,
      ownerId,
      logSource,
      remoteServer,
      status: LogAnalysisJobStatus.INITIALIZED,
      ticketingSystemConfig: props.ticketingSystemConfig || {}
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

  async addAnomaly(job:LogAnalysisJob, {title, description, severity}: {
    title: string,
    description?: string,
    severity: AnomalySeverity,
  }){
    // check if the job has an anomaly
    // if yes then ignore
    // if no then create a new anomanly and add it to the job
    const existingAnomaly = await this.anomalyRepo.findOne({
      where: {
        logAnalysisJob: {id:job.id},
        // this to check that if there is already any anomaly present before this...
        status: In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS]),

      }
    })

    if(existingAnomaly){
      // console.log('Anomaly already exist ...')
      return;
    }

    const anomaly = this.anomalyRepo.create({
      logAnalysisJob: job,
      status:AnomalyStatus.OPEN,
      title,
      description,
      severity
    })

    await this.anomalyRepo.save(anomaly)

    await this.eventEmitter.emit(
      AnomalyCreatedEvent.name, 
      new AnomalyCreatedEvent({
        ownerId: job.ownerId,
        jobId: job.id,
        anomalyId: anomaly.id,
      })
    )
  }
}
