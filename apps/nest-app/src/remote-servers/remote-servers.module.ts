import { Module } from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServersController } from './remote-servers.controller.js';

@Module({
  controllers: [RemoteServersController],
  providers: [RemoteServersService],
})
export class RemoteServersModule {}
