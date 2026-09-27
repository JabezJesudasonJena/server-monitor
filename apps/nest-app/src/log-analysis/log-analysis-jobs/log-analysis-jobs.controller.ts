import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service.js';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto.js';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto.js';
import { CurrentUser } from '../../auth/current-auth.decorator.js';
import type { ICurrentUser } from '../../auth/current-user.interface.js';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(private readonly logAnalysisJobsService: LogAnalysisJobsService) {}

  @Post()
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.create(createLogAnalysisJobDto, currentUser.id);
  }

  @Get()
  findAll(@CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.update(id, updateLogAnalysisJobDto, currentUser.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: ICurrentUser) {
    return this.logAnalysisJobsService.remove(id, currentUser.id);
  }
}

