import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnomalyCreatedEvent } from '../shared/events/anomaly.event.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';
import { AnomalySeverity } from '../log-analysis/log-analysis-jobs/entities/anomaly.entity.js';
import { TicketSeverity } from './ticketing.types.js';

@Injectable()
export class TicketingService {
    constructor(private readonly ticketingProviderFactory: TicketingProviderFactory) {}

    @OnEvent(AnomalyCreatedEvent.name)
    handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {
        const { anomaly, job } = event.payload;
        const providerConfig = job.ticketingSystemConfig;
        if (!providerConfig || !providerConfig?.providerType) {
            return;
        }

        const provider = this.ticketingProviderFactory.create(providerConfig);
        return provider.createTicket({
            title: anomaly.title,
            description: anomaly.description,
            severity: this.mapAnomalySeverityToTicketSeverity(anomaly.severity),
        });
    }

    private mapAnomalySeverityToTicketSeverity(
        severity: AnomalySeverity,
    ): TicketSeverity {
        switch (severity) {
            case AnomalySeverity.LOW: 
                return TicketSeverity.LOW;
            case AnomalySeverity.MEDIUM:
                return TicketSeverity.MEDIUM;
            case AnomalySeverity.HIGH:
                return TicketSeverity.HIGH;
            case AnomalySeverity.CRITICAL:
                return TicketSeverity.CRITICAL;
            default:
                return TicketSeverity.LOW;
        }
    }
}