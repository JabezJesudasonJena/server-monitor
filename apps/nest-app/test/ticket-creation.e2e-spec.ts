import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { DatabaseModule } from './../src/database/database.module.js';
import { DatabaseTestModule } from './../src/database/database-test.module.js';
import { DataSource } from 'typeorm';
import { CreateRemoteServerDto } from '../src/remote-servers/dto/create-remote-server.dto.js';
import { CreateLogAnalysisJobDto } from '../src/log-analysis/log-analysis-jobs/dto/create-log-analysis-job.dto.js';
import { LogAnalysisJobType } from '../src/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity.js';
import { TicketingProviderFactory } from '../src/ticketing/ticketing-providers/ticketing-provider.factory.js';
import { ITicketingProvider } from '../src/ticketing/ticketing-providers/ticketing-providers.interface.js';
import { TicketSeverity } from '../src/ticketing/ticketing.types.js';

describe('Ticket Creation (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let moduleFix: TestingModule;
    const ticketProviderFactory=  mock<TicketingProviderFactory>();
    const ticketProvider=  mock<ITicketingProvider>();

    ticketProviderFactory.create.mockReturnValue(ticketProvider as any);

  beforeEach(async () => {
    moduleFix = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseTestModule)
      .overrideProvider(TicketingProviderFactory)
      .useValue(ticketProviderFactory)
      .compile();

    app = moduleFix.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  describe('ticket creation', () => {
    it('should create ticket', async () => {
      // Create a Remote Server
        const createRemoteServerDto: CreateRemoteServerDto = {
            name: 'test-remote-server',
            config: {
                url: 'http://test-remote-server.com',
            }
        }
        const remoteServerResponse = await request(app.getHttpServer())
            .post('/remote-servers')
            .send(createRemoteServerDto)
            .expect(201)
        console.log(remoteServerResponse.body)

        // Create a job
        const createLogAnalysisJobDto: CreateLogAnalysisJobDto = {
            name: 'test-log-analysis-job',
            type: LogAnalysisJobType.recurring,
            description: 'test-log-analysis-job-description',
            remoteServerId: remoteServerResponse.body.id,
            ticketingSystemConfig: {
                type: "ServiceNowTicketingProvider"
            }
        }

        const LogAnalysisJobResponse = await request(app.getHttpServer())
            .post('/log-analysis-jobs')
            .send(createLogAnalysisJobDto)
            .expect(201)

        console.log(LogAnalysisJobResponse.body)

        // send error logs to the job
        const errorLogs = [
            {
                message: 'test-error-log',
                level: 'error'
            }
        ]
        await request(app.getHttpServer())
            .post(`/log-analysis/ingest/${LogAnalysisJobResponse.body.id}`)
            .send(errorLogs)
            .expect(200)
        
        //    verify the ticket is created

        expect(ticketProvider.createTicket).toHaveBeenCalledTimes(1)
        expect(ticketProvider.createTicket).toHaveBeenLastCalledWith({
            title: 'test-error-log',
            description: expect.any(String),
            severity: TicketSeverity.HIGH
        })


    })
  })

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    }
    await app?.close();
  });
});