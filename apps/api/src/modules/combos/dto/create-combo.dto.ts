import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComboItemInputDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  @IsOptional()
  default_variant_id?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class CreateComboDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsNumber()
  @Min(0)
  combo_price: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboItemInputDto)
  items: ComboItemInputDto[];
}

export class UpdateComboDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  combo_price?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ComboItemInputDto)
  items?: ComboItemInputDto[];
}
