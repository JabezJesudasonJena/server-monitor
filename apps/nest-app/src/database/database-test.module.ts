import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anomaly, LogAnalysisJob } from '../log-analysis/index.js';
import { RemoteServer } from '../remote-servers/entities/remote-server.entity.js';
import { LogSource } from '../log-sources/entities/log-source.entity.js';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'better-sqlite3',
            database: ':memory:',
            entities: [Anomaly, LogAnalysisJob, RemoteServer, LogSource],
            synchronize: true,
            dropSchema: true,
        }),
    ],
})
export class DatabaseTestModule {}
