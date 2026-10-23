import { Test, TestingModule } from '@nestjs/testing';
import { TicketingService } from './ticketing.service.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';
import { ITicketingProvider } from './ticketing-providers/ticketing-providers.interface.js';
import { AnomalyCreatedEvent } from '../shared/events/anomaly.event.js';
import { Anomaly, AnomalySeverity, AnomalyStatus } from '../log-analysis/log-analysis-jobs/entities/anomaly.entity.js';
import { TicketSeverity } from './ticketing.types.js';
import { LogAnalysisJobsService } from '../log-analysis/log-analysis-jobs/log-analysis-jobs.service.js';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../shared/events/ticket.event.js';

describe('TicketingService', () => {
  let service: TicketingService;
  let factory: Mocked<TicketingProviderFactory>;
  let logAnalysisJobsService: Mocked<LogAnalysisJobsService>;
  let mockProvider: Mocked<ITicketingProvider>;
  let eventEmitter: Mocked<EventEmitter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketingService],
    })
      .useMocker(() => mock())
      .compile();

    service = module.get(TicketingService);
    factory = module.get(TicketingProviderFactory);
    logAnalysisJobsService = module.get(LogAnalysisJobsService);
    eventEmitter = module.get(EventEmitter);

    mockProvider = mock<ITicketingProvider>();
    factory.create.mockReturnValue(mockProvider as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(factory).toBeDefined();
    expect(logAnalysisJobsService).toBeDefined();
    expect(eventEmitter).toBeDefined();
  });

  describe('handleAnomalyCreatedEvent', () => {
    const eventPayload = {
      anomalyId: 'anomaly-1',
      jobId: 'job-1',
      ownerId: 'user-1',
    };

    const mockEvent = new AnomalyCreatedEvent(eventPayload);

    const mockAnomaly = {
      id: 'anomaly-1',
      title: 'Database connection error',
      description: 'Connection pool exhausted',
      severity: AnomalySeverity.CRITICAL,
      status: AnomalyStatus.OPEN,
    } as Anomaly;

    const mockConfig = {
      type: 'ServiceNowTicketingProvider',
      instanceUrl: 'https://example.service-now.com',
    };

    it('should return early without creating a ticket if ticketingSystemConfig is missing', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(null as any);

      const result = await service.handleAnomalyCreatedEvent(mockEvent);

      expect(result).toBeUndefined();
      expect(logAnalysisJobsService.getTicketingSystemConfig).toHaveBeenCalledWith(eventPayload.jobId);
      expect(factory.create).not.toHaveBeenCalled();
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return early if ticketingSystemConfig does not contain type', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue({} as any);

      const result = await service.handleAnomalyCreatedEvent(mockEvent);

      expect(result).toBeUndefined();
      expect(logAnalysisJobsService.getTicketingSystemConfig).toHaveBeenCalledWith(eventPayload.jobId);
      expect(factory.create).not.toHaveBeenCalled();
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return early if anomaly is not found', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(mockConfig);
      logAnalysisJobsService.getAnomaly.mockResolvedValue(null);

      const result = await service.handleAnomalyCreatedEvent(mockEvent);

      expect(result).toBeUndefined();
      expect(factory.create).toHaveBeenCalledWith(mockConfig);
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return early if anomaly status is neither OPEN nor IN_PROGRESS', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(mockConfig);
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        ...mockAnomaly,
        status: AnomalyStatus.CLOSED,
      } as Anomaly);

      const result = await service.handleAnomalyCreatedEvent(mockEvent);

      expect(result).toBeUndefined();
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create ticket and emit TicketCreatedEvent when anomaly status is IN_PROGRESS', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(mockConfig);
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        ...mockAnomaly,
        status: AnomalyStatus.IN_PROGRESS,
      } as Anomaly);

      await service.handleAnomalyCreatedEvent(mockEvent);

      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: mockAnomaly.title,
        description: mockAnomaly.description,
        severity: TicketSeverity.CRITICAL,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        TicketCreatedEvent.name,
        new TicketCreatedEvent({
          anomalyId: eventPayload.anomalyId,
        }),
      );
    });

    it('should create ticket and emit TicketCreatedEvent with proper attributes when providerConfig is present and anomaly is OPEN', async () => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(mockConfig);
      logAnalysisJobsService.getAnomaly.mockResolvedValue(mockAnomaly);

      await service.handleAnomalyCreatedEvent(mockEvent);

      expect(logAnalysisJobsService.getTicketingSystemConfig).toHaveBeenCalledWith(eventPayload.jobId);
      expect(factory.create).toHaveBeenCalledWith(mockConfig);
      expect(logAnalysisJobsService.getAnomaly).toHaveBeenCalledWith(eventPayload.anomalyId);
      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: mockAnomaly.title,
        description: mockAnomaly.description,
        severity: TicketSeverity.CRITICAL,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        TicketCreatedEvent.name,
        new TicketCreatedEvent({
          anomalyId: eventPayload.anomalyId,
        }),
      );
    });

    it.each([
      [AnomalySeverity.LOW, TicketSeverity.LOW],
      [AnomalySeverity.MEDIUM, TicketSeverity.MEDIUM],
      [AnomalySeverity.HIGH, TicketSeverity.HIGH],
      [AnomalySeverity.CRITICAL, TicketSeverity.CRITICAL],
    ])('should map %s to %s and emit TicketCreatedEvent', async (anomalySeverity, expectedTicketSeverity) => {
      logAnalysisJobsService.getTicketingSystemConfig.mockResolvedValue(mockConfig);
      logAnalysisJobsService.getAnomaly.mockResolvedValue({
        ...mockAnomaly,
        severity: anomalySeverity,
      } as Anomaly);

      await service.handleAnomalyCreatedEvent(mockEvent);

      expect(mockProvider.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: expectedTicketSeverity,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        TicketCreatedEvent.name,
        new TicketCreatedEvent({
          anomalyId: eventPayload.anomalyId,
        }),
      );
    });
  });
});
