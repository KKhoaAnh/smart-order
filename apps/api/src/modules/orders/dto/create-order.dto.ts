import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  @IsOptional()
  variant_id?: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @IsOptional()
  option_ids?: number[];
}

export class ComboOrderItemDto {
  @IsNumber()
  combo_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  session_token: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @IsOptional()
  customer_id?: number;

  @IsString()
  @IsOptional()
  coupon_code?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ComboOrderItemDto)
  combos?: ComboOrderItemDto[];
}

export class AddOrderItemsDto {
  @IsString()
  @IsNotEmpty()
  session_token: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
