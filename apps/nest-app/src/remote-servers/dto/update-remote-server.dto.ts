import { PartialType } from '@nestjs/swagger';
import { CreateRemoteServerDto } from './create-remote-server.dto.js';

export class UpdateRemoteServerDto extends PartialType(CreateRemoteServerDto) {}
