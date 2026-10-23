import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../../shared/events/ticket.event.js';
import { TickerCreationContextQuery } from '../../queries/ticket-creation-context.query.js';

@Injectable()
export class MonitoringService {

    constructor (
        private readonly ticketCreationContextQuery: TickerCreationContextQuery
    ){}

    @OnEvent(TicketCreatedEvent.name)
    async handleTicketCreation(event: TicketCreatedEvent) {
        const {anomalyId} = event.payload;
        const {server, ticket} = await this.ticketCreationContextQuery.execute(anomalyId);
        
    }
}
