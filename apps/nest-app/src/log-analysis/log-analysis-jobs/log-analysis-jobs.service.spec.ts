import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service.js';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogAnalysisJobsService],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
