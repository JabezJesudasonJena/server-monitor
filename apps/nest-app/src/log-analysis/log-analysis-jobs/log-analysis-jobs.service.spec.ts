import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service.js';
import { LogAnalysisJob, LogAnalysisJobStatus, LogAnalysisJobType } from './entities/log-analysis-job.entity.js';
import { Anomaly, AnomalySeverity, AnomalyStatus } from './entities/anomaly.entity.js';
import { Repository, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LogSourcesService } from '../../log-sources/log-sources.service.js';
import { RemoteServersService } from '../../remote-servers/remote-servers.service.js';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto.js';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto.js';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { AnomalyCreatedEvent } from '../../shared/events/anomaly.event.js';
import { LogSource } from '../../log-sources/entities/log-source.entity.js';
import { RemoteServer } from '../../remote-servers/entities/remote-server.entity.js';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repo: Mocked<Repository<LogAnalysisJob>>;
  let anomalyRepo: Mocked<Repository<Anomaly>>;
  let logSourcesService: Mocked<LogSourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;
  let eventEmitter: Mocked<EventEmitter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService]
    })
    .useMocker(() => mock())
    .compile();

    service = module.get(LogAnalysisJobsService);
    repo = module.get(getRepositoryToken(LogAnalysisJob));
    anomalyRepo = module.get(getRepositoryToken(Anomaly));
    logSourcesService = module.get(LogSourcesService);
    remoteServersService = module.get(RemoteServersService);
    eventEmitter = module.get(EventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(logSourcesService).toBeDefined();
    expect(remoteServersService).toBeDefined();
    expect(eventEmitter).toBeDefined();
  });

  describe('create', () => {
    const getCreateDto = (overrides: Partial<CreateLogAnalysisJobDto> = {}) => {
      return {
        name: 'Test Job',
        description: 'Test Description',
        status: LogAnalysisJobStatus.PENDING,
        type: LogAnalysisJobType.one_time,
        logSourceId: 'log-source-1',
        remoteServerId: 'remote-server-1',
        ...overrides
      } as CreateLogAnalysisJobDto;
    }
    const logSource = new LogSource();
    const remoteServer = new RemoteServer();

    beforeEach(() => {
      logSourcesService.findOne.mockResolvedValue(logSource);
      remoteServersService.findOne.mockResolvedValue(remoteServer);
      repo.save.mockResolvedValue(getCreateDto() as any);
    })

    it('should create a new log analysis job', async () => {
      const createDto = getCreateDto();

      const result = await service.create(createDto, 'owner-1');

      expect(repo.save).toHaveBeenCalledWith({
        ...createDto,
        ownerId: 'owner-1',
        logSource: logSource,
        remoteServer: remoteServer,
        status: LogAnalysisJobStatus.INITIALIZED
      });
      expect(result).toEqual(createDto);

    });

    // it('should create a new log analysis job with custom ticketingSystemConfixg', async () => {
    //   const createDto = getCreateDto({
    //     ticketingSystemConfig: { type: 'jira', projectKey: 'PROJ' },
    //   });

    //   await service.create(createDto, 'owner-1');

    //   expect(service.create).toHaveBeenCalledWith({
    //     ...createDto,
    //     ownerId: 'owner-1',
    //     logSource: logSource,
    //     remoteServer: remoteServer,
    //     status: LogAnalysisJobStatus.INITIALIZED,
    //     ticketingSystemConfig: { type: 'jira', projectKey: 'PROJ' },
    //   });
    // });

    it('should not throw NotFoundException if log source is not found', async () => {
      const createDto = getCreateDto({
        logSourceId: undefined
      })

      await service.create(createDto, 'owner-1')

      expect(logSourcesService.findOne).toHaveBeenCalledTimes(0)
    });

  //   it('should throw NotFoundException if remote server is not found', async () => {
  //     logSourcesService.getById.mockResolvedValue({ id: 'log-source-1' } as any);
  //     remoteServersService.getById.mockResolvedValue(null);

  //     await expect(service.create(props, 'user-1')).rejects.toThrow(NotFoundException);
  //   });
  // });
  }); 

  describe('addAnomaly', () => {
    const mockJob = { id: 'job-1', ownerId: 'user-1' } as LogAnalysisJob;
    const anomalyData = {
      title: 'Database connection failed',
      description: 'Connection timed out',
      severity: AnomalySeverity.HIGH,
    };

    it('should return without doing anything if an anomaly with status OPEN or IN_PROGRESS already exists', async () => {
      const existingAnomaly = { id: 'anomaly-1', status: AnomalyStatus.OPEN } as Anomaly;
      anomalyRepo.findOne.mockResolvedValue(existingAnomaly);

      await service.addAnomaly(mockJob, anomalyData);

      expect(anomalyRepo.findOne).toHaveBeenCalledWith({
        where: {
          logAnalysisJob: { id: mockJob.id },
          status: In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS]),
        },
      });
      expect(anomalyRepo.create).not.toHaveBeenCalled();
      expect(anomalyRepo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create and save an anomaly with appropriate fields if no active anomaly exists', async () => {
      anomalyRepo.findOne.mockResolvedValue(null);
      const createdAnomaly = {
        id: 'anomaly-1',
        logAnalysisJob: mockJob,
        status: AnomalyStatus.OPEN,
        ...anomalyData,
      } as Anomaly;
      anomalyRepo.create.mockReturnValue(createdAnomaly);
      anomalyRepo.save.mockResolvedValue(createdAnomaly);

      await service.addAnomaly(mockJob, anomalyData);

      expect(anomalyRepo.findOne).toHaveBeenCalledWith({
        where: {
          logAnalysisJob: { id: mockJob.id },
          status: In([AnomalyStatus.OPEN, AnomalyStatus.IN_PROGRESS]),
        },
      });
      expect(anomalyRepo.create).toHaveBeenCalledWith({
        logAnalysisJob: mockJob,
        status: AnomalyStatus.OPEN,
        title: anomalyData.title,
        description: anomalyData.description,
        severity: anomalyData.severity,
      });
      expect(anomalyRepo.save).toHaveBeenCalledWith(createdAnomaly);
    });

    it('should emit AnomalyCreatedEvent with ownerId, jobId, and anomalyId when an anomaly is created', async () => {
      anomalyRepo.findOne.mockResolvedValue(null);
      const createdAnomaly = {
        id: 'anomaly-1',
        logAnalysisJob: mockJob,
        status: AnomalyStatus.OPEN,
        ...anomalyData,
      } as Anomaly;
      anomalyRepo.create.mockReturnValue(createdAnomaly);
      anomalyRepo.save.mockResolvedValue(createdAnomaly);

      await service.addAnomaly(mockJob, anomalyData);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AnomalyCreatedEvent.name,
        new AnomalyCreatedEvent({
          ownerId: mockJob.ownerId,
          jobId: mockJob.id,
          anomalyId: createdAnomaly.id,
        }),
      );
    });
  });
});