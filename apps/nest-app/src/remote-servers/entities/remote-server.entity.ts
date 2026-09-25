import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum RemoteServerStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    UNKNOWN = 'unknown',
}


@Entity()
export class RemoteServer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;
    
    @Column()
    ownerId: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'simple-json' })
    config: Record<string, any>;

    @Column({ type: 'text', enum: RemoteServerStatus, default: RemoteServerStatus.UNKNOWN })
    status: RemoteServerStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
