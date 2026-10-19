import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';
import { LogAnalysisModule } from '../log-analysis/log-analysis.module.js';

@Module({
  providers: [TicketingService, TicketingProviderFactory],
  imports: [LogAnalysisModule],
})
export class TicketingModule {}
