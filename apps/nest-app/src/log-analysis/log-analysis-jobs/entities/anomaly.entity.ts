import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { LogAnalysisJob } from "./log-analysis-job.entity.js";

export enum AnomalyStatus {
    OPEN="open",
    IN_PROGRESS="in_progress",
    CLOSED="closed"
}

export enum AnomalySeverity {
    LOW='low',
    MEDIUM='medium',
    HIGH='high',
    CRITICAL='critical'
}

@Entity()
export class Anomaly {
    @PrimaryGeneratedColumn("uuid")
    id:string;

    @Column()
    title:string;

    @Column({nullable: true})
    description?: string;

    @Column()
    severity: AnomalySeverity;

    @Column({type: 'simple-json', nullable: true})
    ticketInfo?: Record<string, any>;

    @ManyToOne(() => LogAnalysisJob, (job) => job.anomalies)
    logAnalysisJob: Relation<LogAnalysisJob>;

}