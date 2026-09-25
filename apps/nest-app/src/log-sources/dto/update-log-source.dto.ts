import { PartialType } from '@nestjs/swagger';
import { CreateLogSourceDto } from './create-log-source.dto.js';

export class UpdateLogSourceDto extends PartialType(CreateLogSourceDto) {
    
}
