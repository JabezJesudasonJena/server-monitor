import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { UsersModule } from './users/users.module.js';
import { RemoteServersModule } from './remote-servers/remote-servers.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LogSourcesModule } from './log-sources/log-sources.module.js';
import { LogAnalysisModule } from './log-analysis/log-analysis.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TicketingModule } from './ticketing/ticketing.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    RemoteServersModule,
    AuthModule,
    LogSourcesModule,
    LogAnalysisModule,
    EventEmitterModule.forRoot(),
    TicketingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
