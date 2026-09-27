import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service.js';
import { LogAnalysisJob, LogAnalysisJobStatus, LogAnalysisJobType } from './entities/log-analysis-job.entity.js';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LogSourcesService } from '../../log-sources/log-sources.service.js';
import { RemoteServersService } from '../../remote-servers/remote-servers.service.js';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto.js';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto.js';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repo: Mocked<Repository<LogAnalysisJob>>;
  let logSourcesService: Mocked<LogSourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJob),
          useValue: mock<Repository<LogAnalysisJob>>(),
        },
        {
          provide: LogSourcesService,
          useValue: mock<LogSourcesService>(),
        },
        {
          provide: RemoteServersService,
          useValue: mock<RemoteServersService>(),
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
    repo = module.get<Mocked<Repository<LogAnalysisJob>>>(getRepositoryToken(LogAnalysisJob));
    logSourcesService = module.get<Mocked<LogSourcesService>>(LogSourcesService);
    remoteServersService = module.get<Mocked<RemoteServersService>>(RemoteServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(logSourcesService).toBeDefined();
    expect(remoteServersService).toBeDefined();
  });

  describe('create', () => {
    const props: CreateLogAnalysisJobDto = {
      name: 'Test Job',
      description: 'Test Description',
      status: LogAnalysisJobStatus.PENDING,
      type: LogAnalysisJobType.one_time,
      ownerId: 'user-1',
      logSourceId: 'log-source-1',
      remoteServerId: 'remote-server-1',
    };

    it('should create a new log analysis job', async () => {
      const mockLogSource = { id: 'log-source-1' } as any;
      const mockRemoteServer = { id: 'remote-server-1' } as any;
      const createdJob = { ...props, logSource: mockLogSource, remoteServer: mockRemoteServer } as any;
      const savedJob = { id: 'job-1', ...createdJob } as any;

      logSourcesService.getById.mockResolvedValue(mockLogSource);
      remoteServersService.getById.mockResolvedValue(mockRemoteServer);
      repo.create.mockReturnValue(createdJob);
      repo.save.mockResolvedValue(savedJob);

      const result = await service.create(props, 'user-1');

      expect(logSourcesService.getById).toHaveBeenCalledTimes(1);
      expect(logSourcesService.getById).toHaveBeenCalledWith('log-source-1', 'user-1');
      expect(remoteServersService.getById).toHaveBeenCalledTimes(1);
      expect(remoteServersService.getById).toHaveBeenCalledWith('remote-server-1', 'user-1');
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: 'user-1',
        logSource: mockLogSource,
        remoteServer: mockRemoteServer,
        status: LogAnalysisJobStatus.INITIALIZED,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdJob);
      expect(result).toEqual(savedJob);
    });

    it('should throw NotFoundException if log source is not found', async () => {
      logSourcesService.getById.mockResolvedValue(null);
      remoteServersService.getById.mockResolvedValue({ id: 'remote-server-1' } as any);

      await expect(service.create(props, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if remote server is not found', async () => {
      logSourcesService.getById.mockResolvedValue({ id: 'log-source-1' } as any);
      remoteServersService.getById.mockResolvedValue(null);

      await expect(service.create(props, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all log analysis jobs for an owner', async () => {
      const jobs = [{ id: 'job-1', ownerId: 'user-1' }] as any;
      repo.find.mockResolvedValue(jobs);

      const result = await service.findAll('user-1');

      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: 'user-1' } });
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should find one log analysis job by id and ownerId', async () => {
      const job = { id: 'job-1', ownerId: 'user-1' } as any;
      repo.findOneBy.mockResolvedValue(job);

      const result = await service.findOne('job-1', 'user-1');

      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'job-1', ownerId: 'user-1' });
      expect(result).toEqual(job);
    });

    it('should throw NotFoundException when job is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('job-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getbyId', () => {
    it('should get a job by id and ownerId', async () => {
      const job = { id: 'job-1', ownerId: 'user-1' } as any;
      repo.findOneBy.mockResolvedValue(job);

      const result = await service.getbyId('job-1', 'user-1');

      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'job-1', ownerId: 'user-1' });
      expect(result).toEqual(job);
    });

    it('should throw NotFoundException when job is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.getbyId('job-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateLogAnalysisJobDto = {
      description: 'Updated description',
    };

    it('should update a log analysis job', async () => {
      const existingJob = { id: 'job-1', ownerId: 'user-1', description: 'Old description' } as any;
      const updatedJob = { ...existingJob, ...updateDto };

      repo.findOneBy.mockResolvedValue(existingJob);
      repo.save.mockResolvedValue(updatedJob);

      const result = await service.update('job-1', updateDto, 'user-1');

      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'job-1', ownerId: 'user-1' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({ ...existingJob, ...updateDto });
      expect(result).toEqual(updatedJob);
    });

    it('should throw NotFoundException when job to update is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.update('job-1', updateDto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a log analysis job', async () => {
      const existingJob = { id: 'job-1', ownerId: 'user-1' } as any;

      repo.findOneBy.mockResolvedValue(existingJob);
      repo.remove.mockResolvedValue(existingJob);

      const result = await service.remove('job-1', 'user-1');

      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'job-1', ownerId: 'user-1' });
      expect(repo.remove).toHaveBeenCalledTimes(1);
      expect(repo.remove).toHaveBeenCalledWith(existingJob);
      expect(result).toEqual(existingJob);
    });

    it('should throw NotFoundException when job to remove is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('job-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
