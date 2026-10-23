import { Module } from '@nestjs/common';
import { TickerCreationContextQuery } from './ticket-creation-context.query.js';

@Module({
    providers: [TickerCreationContextQuery],
    exports: [TickerCreationContextQuery]
})
export class QueriesModule {}