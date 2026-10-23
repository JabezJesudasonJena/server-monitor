import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServer, RemoteServerStatus } from './entities/remote-server.entity.js';
import { Repository } from 'typeorm/browser';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto.js';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemoteServersService,
      ]
    })
    .useMocker(() => mock())
    .compile();
    service = module.get(RemoteServersService);
    repo = module.get(getRepositoryToken(RemoteServer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create',  () => {
    it('should create a new remote server', async () => {
      // Arrange

      const createDto: CreateRemoteServerDto = {
        name: 'test-remote-server',
        description: 'test-desc'
      }
      
      // Act
      const result = await service.create(createDto, '1')

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...createDto,
        ownerId: '1'
      });
    })
  })
});
