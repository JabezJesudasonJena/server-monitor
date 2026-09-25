import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServer, RemoteServerStatus } from './entities/remote-server.entity.js';
import { Repository } from 'typeorm/browser';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemoteServersService,
      {
        provide: getRepositoryToken(RemoteServer),
        useValue: mock<Repository<RemoteServer>>(),
      }]
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);
    repo = module.get<Mocked<Repository<RemoteServer>>>(getRepositoryToken(RemoteServer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create',  () => {
    it('should create a new remote server', async () => {
      // Arrange
      const props = {} as any;
      const createdProp = {} as any;
      const savedProps  = {} as any;
      repo.save.mockResolvedValue(props);
      repo.create.mockReturnValue(createdProp)
      
      // Act
      const result = await service.create(props, '1')

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: RemoteServerStatus.UNKNOWN
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdProp);
      expect(result).toEqual(savedProps);

    })
  })

  describe('find all', () => {
    it('it should return all users' , async () => {
      const remoteServers = [] as any;
      repo.find.mockResolvedValue(remoteServers);

      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(remoteServers);
    })
  })

  describe('find one', () => {
    it('should find one remote server', async () => {
      const remoteServer = {} as any;
      repo.findOne.mockResolvedValue(remoteServer);

      const result = await service.findOne('1', '1');
      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({where: {id: '1', ownerId: '1'}});
      expect(result).toEqual(remoteServer);
    })
  })

  describe('update', () => {
    it('should update a remote server', async () => {
      const remoteServer = {} as any;
      repo.findOne.mockResolvedValue(remoteServer);
      repo.save.mockResolvedValue(remoteServer);
      repo.merge.mockReturnValue(remoteServer);

      const result = await service.update('1', {} as any, '1');
      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({where: {id: '1', ownerId: '1'}});
      expect(repo.merge).toHaveBeenCalledTimes(1);
      expect(repo.merge).toHaveBeenCalledWith(remoteServer, {} as any);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(remoteServer);
      expect(result).toEqual(remoteServer);
    })

    it('should return not found when remote server is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('1', {} as any, '1')).rejects.toThrow(NotFoundException);
    })
  })

  /* 
  describe('remove', () => {
    it('should remove a server', async () => {
      repo.delete.mockResolvedValue({affected: 1});

      const result = await service.remove('1', '1');
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({id: '1', ownerId: '1'});
      expect(result).toEqual(undefined);
    })

    it('should return not found when remote server is not found', async () => {
      repo.delete.mockResolvedValue({affected: 0});

      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);
    })
  })
  */


});
