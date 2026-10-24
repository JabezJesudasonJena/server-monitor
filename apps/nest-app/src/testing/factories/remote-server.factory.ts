import { DataSource, DeepPartial } from 'typeorm';
import { RemoteServer, RemoteServerStatus } from '../../remote-servers/entities/remote-server.entity.js';

const defaults = (): DeepPartial<RemoteServer> => ({
    name: 'test-server',
    ownerId: 'owner-uuid-001',
    description: 'A test remote server',
    config: {
        host: '127.0.0.1',
        username: 'root',
        privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMOCK\n-----END RSA PRIVATE KEY-----',
    },
    isConnectionConfigured: true,
    status: RemoteServerStatus.UNKNOWN,
});

export async function createRemoteServer(
    dataSource: DataSource,
    overrides: DeepPartial<RemoteServer> = {},
): Promise<RemoteServer> {
    const repo = dataSource.getRepository(RemoteServer);
    const entity = repo.create({ ...defaults(), ...overrides });
    return repo.save(entity);
}
