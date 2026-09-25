import { Module } from '@nestjs/common';
import { LogSourcesService } from './log-sources.service.js';
import { LogSourcesController } from './log-sources.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogSource } from './entities/log-source.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([LogSource])],
  controllers: [LogSourcesController],
  providers: [LogSourcesService],
})
export class LogSourcesModule {}
