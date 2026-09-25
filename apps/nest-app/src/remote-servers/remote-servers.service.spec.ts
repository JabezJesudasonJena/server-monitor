import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServer, RemoteServerStatus } from './entities/remote-server.entity.js';
import { Repository } from 'typeorm/browser';
import { getRepositoryToken } from '@nestjs/typeorm';

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
});
