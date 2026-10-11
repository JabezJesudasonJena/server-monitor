import { Injectable, NotFoundException } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs/log-analysis-jobs.service.js';
import { AnomalySeverity } from './log-analysis-jobs/entities/anomaly.entity.js';

@Injectable()
export class LogAnalysisService {
    constructor(private logAnalysisJobsService: LogAnalysisJobsService) {}

    async ingestLogs(
        jobId: string,
        ownerId: string, 
        logs: Array<Record<string, any>>
    ) {
        const job = await this.logAnalysisJobsService.findOne(jobId, ownerId);
        if(!job){
            throw new NotFoundException('Job Not found')
        }

        for (const log of logs){
            const message = log['message'] || 'Untitled Log message'
            const level = log['level'] || 'error'

            this.logAnalysisJobsService.addAnomaly(job, {
                title: message,
                description: message,
                severity: level == 'critical' 
                    ? AnomalySeverity.CRITICAL 
                    : AnomalySeverity.HIGH,
            })
        }
        
    }
}
