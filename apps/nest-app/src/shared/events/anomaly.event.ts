import { Anomaly } from "@/src/log-analysis/log-analysis-jobs/entities/anomaly.entity.js";
import { AppEvent } from "./app-event.js";
import { LogAnalysisJob } from "@/src/log-analysis/log-analysis-jobs/entities/log-analysis-job.entity.js";


export interface AnomalyCreatedEventPayload {
    ownerId: string;
    jobId: string;
    anomalyId: string;
}

export class AnomalyCreatedEvent extends AppEvent<AnomalyCreatedEventPayload> {}


