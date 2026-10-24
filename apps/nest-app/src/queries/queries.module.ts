import { Module } from '@nestjs/common';
import { TickerCreationContextQuery } from './ticket-creation-context.query.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anomaly } from '../log-analysis/index.js';

@Module({
    imports: [TypeOrmModule.forFeature([Anomaly])],
    providers: [TickerCreationContextQuery],
    exports: [TickerCreationContextQuery]
})
export class QueriesModule {}