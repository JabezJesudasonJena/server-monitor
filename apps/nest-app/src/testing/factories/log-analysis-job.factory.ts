import { DataSource, DeepPartial } from 'typeorm';
import { LogAnalysisJob, LogAnalysisJobStatus, LogAnalysisJobType } from '../../log-analysis/index.js';
import { RemoteServer } from '../../remote-servers/entities/remote-server.entity.js';
import { createRemoteServer } from './remote-server.factory.js';

const defaults = (): DeepPartial<LogAnalysisJob> => ({
    ownerId: 'owner-uuid-001',
    description: 'A test log analysis job',
    status: LogAnalysisJobStatus.INITIALIZED,
    type: LogAnalysisJobType.one_time,
    ticketingSystemConfig: null,
});

export async function createLogAnalysisJob(
    dataSource: DataSource,
    overrides: DeepPartial<LogAnalysisJob> & { remoteServer?: RemoteServer } = {},
): Promise<LogAnalysisJob> {
    const repo = dataSource.getRepository(LogAnalysisJob);

    // Create a RemoteServer if one was not provided — it's a required relation
    const remoteServer = overrides.remoteServer ?? await createRemoteServer(dataSource);

    const { remoteServer: _ignored, ...rest } = overrides;
    const entity = repo.create({ ...defaults(), ...rest, remoteServer });
    return repo.save(entity);
}
