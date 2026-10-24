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
        (this.ticketCreationContextQuery.execute(anomalyId)).match(
            ({ticket, server}) => {
                
            },
            (err) => {
                switch(err){
                    case 'DATABASE_ERROR':
                        break;
                    case 'ANOMALY_NOT_FOUND':
                        break;
                    case 'TICKETING_INFO_NOT_FOUND':
                        break;
                    case 'SERVER_NOT_FOUND':
                        break;
                }
            }
        );
        
    }
}
