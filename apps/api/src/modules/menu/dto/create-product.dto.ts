import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  variant_name: string;

  @IsNumber()
  price_adjustment: number;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

export class CreateProductDto {
  @IsNumber()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  base_price: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @IsBoolean()
  @IsOptional()
  is_popular?: boolean;

  @IsNumber()
  @IsOptional()
  preparation_time?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];

  @IsArray()
  @IsOptional()
  option_ids?: number[];
}

export class UpdateProductDto {
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  base_price?: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @IsBoolean()
  @IsOptional()
  is_popular?: boolean;

  @IsNumber()
  @IsOptional()
  preparation_time?: number;

  @IsArray()
  @IsOptional()
  option_ids?: number[];
}
