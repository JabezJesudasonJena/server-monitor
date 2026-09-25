import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesService } from './log-sources.service.js';
import { LogSource, LogSourceStatus } from './entities/log-source.entity.js';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('LogSourcesService', () => {
  let service: LogSourcesService;
  let repo: Mocked<Repository<LogSource>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSourcesService,
        {
          provide: getRepositoryToken(LogSource),
          useValue: mock<Repository<LogSource>>(),
        },
      ],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);
    repo = module.get<Mocked<Repository<LogSource>>>(getRepositoryToken(LogSource));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a new log source', async () => {
      // Arrange
      const props = {} as any;
      const createdProp = {} as any;
      const savedProps = {} as any;
      repo.create.mockReturnValue(createdProp);
      repo.save.mockResolvedValue(savedProps);

      // Act
      const result = await service.create(props, '1');

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: LogSourceStatus.UNKNOWN,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdProp);
      expect(result).toEqual(savedProps);
    });
  });

  describe('find all', () => {
    it('should return all log sources', async () => {
      const logSources = [] as any;
      repo.find.mockResolvedValue(logSources);

      const result = await service.findAll('1');
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(logSources);
    });
  });

  describe('find one', () => {
    it('should find one log source', async () => {
      const logSource = {} as any;
      repo.findOne.mockResolvedValue(logSource);

      const result = await service.findOne('1', '1');
      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1', ownerId: '1' } });
      expect(result).toEqual(logSource);
    });

    it('should return not found when log source is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('should get a log source by id', async () => {
      const logSource = {} as any;
      repo.findOneBy.mockResolvedValue(logSource);

      const result = await service.getById('1', '1');
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(logSource);
    });

    it('should return not found when log source is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.getById('1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a log source', async () => {
      const logSource = {} as any;
      repo.findOne.mockResolvedValue(logSource);
      repo.save.mockResolvedValue(logSource);

      const result = await service.update('1', {} as any, '1');
      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1', ownerId: '1' } });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(logSource);
      expect(result).toEqual(logSource);
    });

    it('should return not found when log source is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('1', {} as any, '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a log source', async () => {
      const logSource = {} as any;
      repo.findOneBy.mockResolvedValue(logSource);
      repo.remove.mockResolvedValue(logSource);

      const result = await service.remove('1', '1');
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.remove).toHaveBeenCalledTimes(1);
      expect(repo.remove).toHaveBeenCalledWith(logSource);
      expect(result).toEqual(logSource);
    });

    it('should return not found when log source is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);
    });
  });
});
