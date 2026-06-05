import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  table_number: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  area?: string;
}

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  table_number?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
