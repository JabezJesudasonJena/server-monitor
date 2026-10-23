import { AppEvent } from "./app-event.js";

export interface TicketCreatedEventPayload {
    anomalyId: string
}

export class TicketCreatedEvent extends AppEvent<TicketCreatedEventPayload> {}


