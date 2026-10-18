import { Injectable } from '@nestjs/common';
import type { AnomalyCreatedEventPayload } from '../shared/events/anomaly.event.js';
import { OnEvent } from '@nestjs/event-emitter';
import { AnomalyCreatedEvent } from '../shared/events/anomaly.event.js';

@Injectable()
export class TicketingService {


    @OnEvent(AnomalyCreatedEvent.name)
    handleAnomalyCreatedEvent(event: AnomalyCreatedEventPayload) {
        console.log('anomaly', event);
    }
}