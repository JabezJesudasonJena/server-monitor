import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnomalyCreatedEvent } from '../shared/events/anomaly.event.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';
import { Anomaly, AnomalySeverity, AnomalyStatus } from '../log-analysis/log-analysis-jobs/entities/anomaly.entity.js';
import { TicketSeverity } from './ticketing.types.js';
import { LogAnalysisJobsService } from '../log-analysis/log-analysis-jobs/log-analysis-jobs.service.js';

@Injectable()
export class TicketingService {
    constructor(
        private readonly ticketingProviderFactory: TicketingProviderFactory,
        private readonly logAnalysisJobsService: LogAnalysisJobsService
    ) {}

    @OnEvent(AnomalyCreatedEvent.name)
    async handleAnomalyCreatedEvent(event: AnomalyCreatedEvent) {

        const {anomalyId, jobId, ownerId} = event.payload
   
        const providerConfig = await this.logAnalysisJobsService.getTicketingSystemConfig(jobId);

        if (!providerConfig?.type) {
            return;
        }

        const provider = this.ticketingProviderFactory.create(providerConfig);
        const anomaly = await this.logAnalysisJobsService.getAnomaly(anomalyId)
        
        if (!anomaly || (anomaly.status !== AnomalyStatus.OPEN && anomaly.status !== AnomalyStatus.IN_PROGRESS)) {
            return;  
        }

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