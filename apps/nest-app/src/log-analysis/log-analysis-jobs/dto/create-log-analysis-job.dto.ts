import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { LogAnalysisJobStatus, LogAnalysisJobType } from "../entities/log-analysis-job.entity.js";
import { LogSource } from "../../../log-sources/entities/log-source.entity.js";

export class CreateLogAnalysisJobDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(LogAnalysisJobStatus)
    status: LogAnalysisJobStatus;

    @IsEnum(LogAnalysisJobType)
    type: LogAnalysisJobType;

    @IsString()
    ownerId: string;

    @IsOptional()
    @IsObject()
    ticketingSystemConfig?: Record<string, any>;

    @IsString()
    @IsOptional()
    logSourceId?: string;

    @IsString()
    remoteServerId: string;
}
