import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersController } from './remote-servers.controller.js';
import { RemoteServersService } from './remote-servers.service.js';

describe('RemoteServersController', () => {
  let controller: RemoteServersController;
  let service: Mocked<RemoteServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoteServersController],
      providers: [
        {
          provide: RemoteServersService,
          useValue: mock<RemoteServersService>(),
        },
      ],
    }).compile();

    controller = module.get<RemoteServersController>(RemoteServersController);
    service = module.get<Mocked<RemoteServersService>>(RemoteServersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
