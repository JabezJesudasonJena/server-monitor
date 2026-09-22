import { IsString, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class CreateRemoteServerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    config: Record<string, any>;
}

