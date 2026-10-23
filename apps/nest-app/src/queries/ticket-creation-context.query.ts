import { Injectable } from "@nestjs/common";
import { TicketSeverity, TicketStatus } from "../ticketing/index.js";


export interface TickerCreationContext { 
    ticket : {
        id: string;
        title: string;
        description: string;
        severity: TicketSeverity;
        status: TicketStatus;
    };
    server: {
        isConfigured: boolean;
        sshConfiguration: {
            host: string;
            username: string;
            privateKey: string;
        }
    }
}

@Injectable()
export class TickerCreationContextQuery {

    async execute(anomalyId: string): Promise<TickerCreationContext> {
        throw new Error('Not Implemented !');
    }
}