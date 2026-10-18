import { Test, TestingModule } from '@nestjs/testing';
import { TicketingService } from './ticketing.service.js';
import { TicketingProviderFactory } from './ticketing-providers/ticketing-provider.factory.js';

describe('TicketingService', () => {
  let service: TicketingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketingService,
        {
          provide: TicketingProviderFactory,
          useValue: mock<TicketingProviderFactory>(),
        },
      ],
    }).compile();

    service = module.get<TicketingService>(TicketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
