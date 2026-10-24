import { DataSource } from "typeorm"
import { TickerCreationContextQuery } from "./ticket-creation-context.query.js"
import { Test } from "@nestjs/testing"
import { DatabaseTestModule } from "../database/database-test.module.js"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Anomaly } from "../log-analysis/index.js"
import { createAnomaly, createRemoteServer } from "../testing/factories/index.js"
import { AnomalyStatus, AnomalySeverity } from "../log-analysis/index.js"
import {err} from 'neverthrow'


describe('TicketCreationContextQuery Integration tests', () => {
    let query: TickerCreationContextQuery
    let datasource: DataSource

    beforeEach(async() => {
        const module = await Test.createTestingModule({
            imports: [DatabaseTestModule, TypeOrmModule.forFeature([Anomaly])],
            providers: [TickerCreationContextQuery]
        }).compile()

        query = module.get(TickerCreationContextQuery);
        datasource = module.get(DataSource)
    })

    afterEach(async () => {
        await datasource.destroy();
    })

    it('should be defined', () => {
        expect(query).toBeDefined();
        expect(datasource).toBeDefined();

        const repo = datasource.getRepository(Anomaly)
        expect(repo).toBeDefined();
    })

    it('should return anomaly not found when the anomaly does not exist', async () => {
        const result = await query.execute('anomaly-id-1');
        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('ANOMALY_NOT_FOUND');
    })

    it('should return ticket info not found when the anomaly has no ticket', async () => {
        const anomaly = await createAnomaly(datasource, {
            ticketInfo: undefined
        });
        const result = await query.execute(anomaly.id);
        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('TICKETING_INFO_NOT_FOUND');
    })

    it('should return server not found when the anomaly has no server' , async() => {
        const anomaly = await createAnomaly(datasource, {
            logAnalysisJob: {
                remoteServer: null, 
            }
        });
        const result = await query.execute(anomaly.id);
        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('SERVER_NOT_FOUND');
    })


})
