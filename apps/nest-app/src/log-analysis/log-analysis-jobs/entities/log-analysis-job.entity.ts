import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { LogSource } from "../../../log-sources/entities/log-source.entity.js";
import { RemoteServer } from "../../../remote-servers/entities/remote-server.entity.js";

export enum LogAnalysisJobStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    INITIALIZED = 'initialized',
    FAILED = 'failed'
}

export enum LogAnalysisJobType {
    one_time = 'one_time',
    recurring = 'recurring'
}

@Entity()
export class LogAnalysisJob {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ownerId: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    status: LogAnalysisJobStatus;

    @Column()
    type: LogAnalysisJobType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => LogSource)
    @JoinColumn()
    logSource: LogSource;

    @OneToOne(() => RemoteServer)
    @JoinColumn()
    remoteServer: RemoteServer;

}