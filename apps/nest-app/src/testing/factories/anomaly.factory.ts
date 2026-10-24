import { DataSource, DeepPartial } from 'typeorm';
import { Anomaly, AnomalySeverity, AnomalyStatus } from '../../log-analysis/index.js';
import { LogAnalysisJob } from '../../log-analysis/index.js';
import { createLogAnalysisJob } from './log-analysis-job.factory.js';

const defaults = (): DeepPartial<Anomaly> => ({
    status: AnomalyStatus.OPEN,
    title: 'Test Anomaly',
    description: 'A test anomaly description',
    severity: AnomalySeverity.MEDIUM,
    ticketInfo: null,
});

export async function createAnomaly(
    dataSource: DataSource,
    overrides: DeepPartial<Anomaly> & { logAnalysisJob?: LogAnalysisJob } = {},
): Promise<Anomaly> {
    const repo = dataSource.getRepository(Anomaly);

    // Create a LogAnalysisJob (and its RemoteServer) if one was not provided
    const logAnalysisJob = overrides.logAnalysisJob ?? await createLogAnalysisJob(dataSource);

    const { logAnalysisJob: _ignored, ...rest } = overrides;
    const entity = repo.create({ ...defaults(), ...rest, logAnalysisJob });
    return repo.save(entity);
}
