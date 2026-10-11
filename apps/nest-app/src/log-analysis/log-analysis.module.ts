import { Module } from '@nestjs/common';
import { LogAnalysisJobsModule } from './log-analysis-jobs/log-analysis-jobs.module.js';
import { LogAnalysisController } from './log-analysis.controller.js';
import { LogAnalysisService } from './log-analysis.service.js';

@Module({
  imports: [LogAnalysisJobsModule],
  controllers: [LogAnalysisController],
  providers: [LogAnalysisService],
  exports: [LogAnalysisService]
})
export class LogAnalysisModule { }
