import { Injectable } from "@nestjs/common";
import type {Ticket} from "../ticketing/index.js"
import { Repository } from "typeorm";
import { Anomaly } from "../log-analysis/index.js";
import { InjectRepository } from "@nestjs/typeorm";
import { ok, err, fromPromise } from 'neverthrow';

export interface SshConfiguration {
    host: string;
    username: string;
    privateKey: string;
}


export interface TickerCreationContext { 
    ticket: Ticket;
    server: {
        isConfigured: boolean;
        sshConfiguration: SshConfiguration;
    };
}

@Injectable()
export class TickerCreationContextQuery {

    constructor(
        @InjectRepository(Anomaly)
        private readonly anomalyRepo: Repository<Anomaly>
    ) {}

    execute(anomalyId: string) {
        return fromPromise(this.anomalyRepo.findOne({
            where: {id: anomalyId},
            relations: {
                logAnalysisJob: {
                    remoteServer: true
                }
            }
        }), 
        () => 'DATABASE_ERROR' as const
        ).andThen((anomaly) => {
            if(!anomaly) {
                return err('ANOMALY_NOT_FOUND' as const)
            }
            if(!anomaly.ticketInfo){
                return err('TICKETING_INFO_NOT_FOUND' as const)
            }

            const server = anomaly.logAnalysisJob?.remoteServer

            if(!server){
                return err('SERVER_NOT_FOUND' as const);
            }

            if(!anomaly.ticketInfo){
                return err('TICKETING_INFO_NOT_FOUND' as const)
            }

            const result: TickerCreationContext = {
                ticket: anomaly.ticketInfo as Ticket,
                server: {
                    isConfigured: server.isConnectionConfigured,
                    sshConfiguration: server.config as SshConfiguration
                }
            }

            return ok(result);
        })
    }
}


class TicketingInfoNotFound {

}