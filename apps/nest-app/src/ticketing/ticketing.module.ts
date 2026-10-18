import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';

@Module({
  providers: [TicketingService, TicketingProviderFactory]
})
export class TicketingModule {}
