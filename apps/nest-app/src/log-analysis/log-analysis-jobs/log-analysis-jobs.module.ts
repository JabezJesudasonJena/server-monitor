import { Module } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service.js';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAnalysisJob } from './entities/log-analysis-job.entity.js';
import { LogSourcesModule } from '../../log-sources/log-sources.module.js';
import { RemoteServersModule } from '../../remote-servers/remote-servers.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogAnalysisJob]),
    LogSourcesModule,
    RemoteServersModule
  ],
  controllers: [LogAnalysisJobsController],
  providers: [LogAnalysisJobsService],
})
export class LogAnalysisJobsModule {}
