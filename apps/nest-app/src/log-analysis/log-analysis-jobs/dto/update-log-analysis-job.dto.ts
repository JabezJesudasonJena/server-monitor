import { PartialType } from '@nestjs/mapped-types';
import { CreateLogAnalysisJobDto } from './create-log-analysis-job.dto.js';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LogAnalysisJobStatus, LogAnalysisJobType } from '../entities/log-analysis-job.entity.js';

export class UpdateLogAnalysisJobDto  {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(LogAnalysisJobStatus)
    status?: LogAnalysisJobStatus;

    @IsOptional()
    @IsEnum(LogAnalysisJobType)
    type?: LogAnalysisJobType;
}
