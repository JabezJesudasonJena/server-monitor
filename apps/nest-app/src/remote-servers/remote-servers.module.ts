import { Module } from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServersController } from './remote-servers.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServer } from './entities/remote-server.entity.js';
import { MonitoringService } from './monitoring/monitoring.service.js';
import { QueriesModule } from '../queries/queries.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteServer]),QueriesModule],
  controllers: [RemoteServersController],
  providers: [RemoteServersService, MonitoringService],
  exports: [RemoteServersService]
})
export class RemoteServersModule {}
