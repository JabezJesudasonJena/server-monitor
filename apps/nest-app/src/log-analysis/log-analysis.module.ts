import { Module } from '@nestjs/common';
import { LogAnalysisJobsModule } from './log-analysis-jobs/log-analysis-jobs.module.js';
import { LogAnalysisController } from './log-analysis.controller.js';

@Module({
  imports: [LogAnalysisJobsModule],
  controllers: [LogAnalysisController]
})
export class LogAnalysisModule {}
