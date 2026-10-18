import { Test, TestingModule } from '@nestjs/testing';
import { TicketingService } from './ticketing.service.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';
import { ITicketingProvider } from './ticketing-providers/ticketing-providers.interface.js';
import { AnomalyCreatedEvent } from '../shared/events/anomaly.event.js';
import { AnomalySeverity } from '../log-analysis/log-analysis-jobs/entities/anomaly.entity.js';
import { Ticket, TicketSeverity, TicketStatus } from './ticketing.types.js';
import type { Mocked } from 'vitest-mock-extended';

describe('TicketingService', () => {
  let service: TicketingService;
  let factory: Mocked<TicketingProviderFactory>;
  let mockProvider: Mocked<ITicketingProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        {
          provide: TicketingProviderFactory,
          useValue: mock<TicketingProviderFactory>(),
        },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
    factory = module.get(TicketingProviderFactory);

    mockProvider = mock<ITicketingProvider>();
    factory.create.mockReturnValue(mockProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(factory).toBeDefined();
  });

  describe('handleAnomalyCreatedEvent', () => {
    const mockAnomaly = {
      id: 'anomaly-1',
      title: 'Database connection error',
      description: 'Connection pool exhausted',
      severity: AnomalySeverity.CRITICAL,
    } as any;

    const mockJob = {
      id: 'job-1',
      ticketingSystemConfig: {
        providerType: 'ServiceNowTicketingProvider',
        instanceUrl: 'https://example.service-now.com',
      },
    } as any;

    const mockEvent = new AnomalyCreatedEvent({
      anomaly: mockAnomaly,
      job: mockJob,
    });

    it('should return early without creating a ticket if ticketingSystemConfig is missing', async () => {
      const eventWithoutConfig = new AnomalyCreatedEvent({
        anomaly: mockAnomaly,
        job: { ...mockJob, ticketingSystemConfig: undefined },
      });

      const result = await service.handleAnomalyCreatedEvent(eventWithoutConfig);

      expect(result).toBeUndefined();
      expect(factory.create).not.toHaveBeenCalled();
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
    });

    it('should return early if ticketingSystemConfig does not contain providerType', async () => {
      const eventWithoutProviderType = new AnomalyCreatedEvent({
        anomaly: mockAnomaly,
        job: { ...mockJob, ticketingSystemConfig: {} },
      });

      const result = await service.handleAnomalyCreatedEvent(eventWithoutProviderType);

      expect(result).toBeUndefined();
      expect(factory.create).not.toHaveBeenCalled();
      expect(mockProvider.createTicket).not.toHaveBeenCalled();
    });

    it('should create and return a ticket with proper attributes when providerConfig is present', async () => {
      const createdTicket: Ticket = {
        id: 'ticket-123',
        title: mockAnomaly.title,
        description: mockAnomaly.description,
        severity: TicketSeverity.CRITICAL,
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProvider.createTicket.mockResolvedValue(createdTicket);

      const result = await service.handleAnomalyCreatedEvent(mockEvent);

      expect(factory.create).toHaveBeenCalledTimes(1);
      expect(factory.create).toHaveBeenCalledWith(mockJob.ticketingSystemConfig);
      expect(mockProvider.createTicket).toHaveBeenCalledTimes(1);
      expect(mockProvider.createTicket).toHaveBeenCalledWith({
        title: mockAnomaly.title,
        description: mockAnomaly.description,
        severity: TicketSeverity.CRITICAL,
      });
      expect(result).toEqual(createdTicket);
    });

    it.each([
      [AnomalySeverity.LOW, TicketSeverity.LOW],
      [AnomalySeverity.MEDIUM, TicketSeverity.MEDIUM],
      [AnomalySeverity.HIGH, TicketSeverity.HIGH],
      [AnomalySeverity.CRITICAL, TicketSeverity.CRITICAL],
    ])('should map %s to %s', async (anomalySeverity, expectedTicketSeverity) => {
      const event = new AnomalyCreatedEvent({
        anomaly: { ...mockAnomaly, severity: anomalySeverity },
        job: mockJob,
      });

      await service.handleAnomalyCreatedEvent(event);

      expect(mockProvider.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: expectedTicketSeverity,
        }),
      );
    });
  });
});
