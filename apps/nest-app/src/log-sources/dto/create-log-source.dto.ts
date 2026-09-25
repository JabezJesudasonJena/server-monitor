import {IsEnum, IsNotEmpty, IsObject, IsOptional, IsString} from 'class-validator'
import { LogSourceType } from '../entities/log-source.entity.js';

export class CreateLogSourceDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    config: Record<string, any>;

    @IsEnum(LogSourceType)
    type: LogSourceType;
}