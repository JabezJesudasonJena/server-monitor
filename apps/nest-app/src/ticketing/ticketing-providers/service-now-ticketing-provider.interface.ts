import { ITicketingProvider } from "./ticketing-providers.interface.js";
import { Ticket, TicketCreate, TicketStatus } from "../ticketing.types.js";

export class ServiceNowTicketingProvider implements ITicketingProvider {

    constructor(private readonly config: Record<string, any>) {}

    
    createTicket(props: TicketCreate): Promise<Ticket> {
        const ticket: Ticket = {
            id: 'random-id',
            title: props.title,
            description: props.description,
            severity: props.severity,
            status: 'open' as TicketStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        console.log('creating ticket', ticket);
        return Promise.resolve(ticket)
    }
    getTicket(ticketId: string): Promise<Ticket> {
        throw new Error('Method not implemented');
    }
    updateTicket(ticketId: string, props: Pick<Ticket, "title" | "description" | "status">): Promise<Ticket> {
        throw new Error('Method not implemented');
    }
}