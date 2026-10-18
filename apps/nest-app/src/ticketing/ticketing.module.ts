import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service.js';

@Module({
  providers: [TicketingService]
})
export class TicketingModule {}
