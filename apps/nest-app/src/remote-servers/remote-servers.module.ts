import { Module } from '@nestjs/common';
import { RemoteServersService } from './remote-servers.service.js';
import { RemoteServersController } from './remote-servers.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteServer } from './entities/remote-server.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteServer])],
  controllers: [RemoteServersController],
  providers: [RemoteServersService],
})
export class RemoteServersModule {}
