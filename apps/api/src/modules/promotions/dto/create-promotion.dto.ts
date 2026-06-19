import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERCENT', 'FIXED', 'FREE_ITEM'])
  type: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  min_order_amount?: number;

  @IsNumber()
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @IsOptional()
  usage_limit?: number;

  @IsNumber()
  @IsOptional()
  per_customer_limit?: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  free_product_id?: number;
}

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERCENT', 'FIXED', 'FREE_ITEM'])
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  min_order_amount?: number;

  @IsNumber()
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @IsOptional()
  usage_limit?: number;

  @IsNumber()
  @IsOptional()
  per_customer_limit?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  free_product_id?: number;
}
