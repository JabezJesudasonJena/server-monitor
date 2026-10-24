import { DataSource, DeepPartial } from 'typeorm';
import { LogSource, LogSourceStatus, LogSourceType } from '../../log-sources/entities/log-source.entity.js';

const defaults = (): DeepPartial<LogSource> => ({
    ownerId: 'owner-uuid-001',
    name: 'test-log-source',
    description: 'A test log source',
    type: LogSourceType.PROMETHEUS,
    status: LogSourceStatus.UNKNOWN,
    config: {
        endpoint: 'http://localhost:9090',
    },
});

export async function createLogSource(
    dataSource: DataSource,
    overrides: DeepPartial<LogSource> = {},
): Promise<LogSource> {
    const repo = dataSource.getRepository(LogSource);
    const entity = repo.create({ ...defaults(), ...overrides });
    return repo.save(entity);
}
