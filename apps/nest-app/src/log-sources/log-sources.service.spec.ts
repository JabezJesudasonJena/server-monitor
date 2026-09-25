import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesService } from './log-sources.service.js';

describe('LogSourcesService', () => {
  let service: LogSourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogSourcesService],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
