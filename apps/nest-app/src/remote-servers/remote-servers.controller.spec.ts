import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersController } from './remote-servers.controller.js';
import { RemoteServersService } from './remote-servers.service.js';

describe('RemoteServersController', () => {
  let controller: RemoteServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoteServersController],
      providers: [RemoteServersService],
    }).compile();

    controller = module.get<RemoteServersController>(RemoteServersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
