import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisService } from './log-analysis.service.js';
import { LogAnalysisJobsService } from './log-analysis-jobs/log-analysis-jobs.service.js';
import { NotFoundException } from '@nestjs/common';
import { AnomalySeverity } from './log-analysis-jobs/entities/anomaly.entity.js';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './log-analysis-jobs/entities/log-analysis-job.entity.js';

describe('LogAnalysisService', () => {
  let service: LogAnalysisService;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogAnalysisService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(LogAnalysisService);
    logAnalysisJobsService = module.get(LogAnalysisJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(logAnalysisJobsService).toBeDefined();
  });

  describe('ingestLogs', () => {
    const jobId = 'job-123';
    const ownerId = 'user-456';
    const mockJob = {
      id: jobId,
      ownerId,
      status: LogAnalysisJobStatus.RUNNING,
      type: LogAnalysisJobType.one_time,
    } as LogAnalysisJob;

    beforeEach(() => {
      logAnalysisJobsService.findOne.mockResolvedValue(mockJob);
    });

    it('should throw NotFoundException when job is not found (null)', async () => {
      logAnalysisJobsService.findOne.mockResolvedValue(null as any);

      const logs = [{ message: 'Database failed', level: 'error' }];

      await expect(service.ingestLogs(jobId, ownerId, logs)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.ingestLogs(jobId, ownerId, logs)).rejects.toThrow(
        'Job Not found',
      );

      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(jobId, ownerId);
      expect(logAnalysisJobsService.addAnomaly).not.toHaveBeenCalled();
    });

    it('should call jobService and add anomaly for every log with proper attributes', async () => {
      const logs = [
        { message: 'Database connection failed', level: 'error' },
        { message: 'Fatal crash detected', level: 'critical' },
      ];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(jobId, ownerId);
      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledTimes(2);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        1,
        mockJob,
        {
          title: 'Database connection failed',
          description: JSON.stringify(logs[0]),
          severity: AnomalySeverity.HIGH,
        },
      );

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        2,
        mockJob,
        {
          title: 'Fatal crash detected',
          description: JSON.stringify(logs[1]),
          severity: AnomalySeverity.CRITICAL,
        },
      );
    });

    it('should set severity to CRITICAL when log level is critical', async () => {
      const logs = [{ message: 'Unrecoverable heap corruption', level: 'critical' }];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(mockJob, {
        title: 'Unrecoverable heap corruption',
        description: JSON.stringify(logs[0]),
        severity: AnomalySeverity.CRITICAL,
      });
    });

    it('should set severity to HIGH when log level is error or any non-critical value', async () => {
      const logs = [
        { message: 'High memory usage', level: 'warn' },
        { message: 'Timeout error', level: 'error' },
      ];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        1,
        mockJob,
        {
          title: 'High memory usage',
          description: JSON.stringify(logs[0]),
          severity: AnomalySeverity.HIGH,
        },
      );

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenNthCalledWith(
        2,
        mockJob,
        {
          title: 'Timeout error',
          description: JSON.stringify(logs[1]),
          severity: AnomalySeverity.HIGH,
        },
      );
    });

    it('should fallback to default title, description, and severity when message and level are missing', async () => {
      const logs = [{}];

      await service.ingestLogs(jobId, ownerId, logs);

      expect(logAnalysisJobsService.addAnomaly).toHaveBeenCalledWith(mockJob, {
        title: 'Untitled Log message',
        description: JSON.stringify(logs[0]),
        severity: AnomalySeverity.HIGH,
      });
    });

    it('should not call addAnomaly when logs array is empty', async () => {
      await service.ingestLogs(jobId, ownerId, []);

      expect(logAnalysisJobsService.findOne).toHaveBeenCalledWith(jobId, ownerId);
      expect(logAnalysisJobsService.addAnomaly).not.toHaveBeenCalled();
    });
  });
});
