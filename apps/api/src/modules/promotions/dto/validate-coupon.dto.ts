import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  store_id: number;

  @IsNumber()
  @Min(0)
  order_amount: number;

  @IsNumber()
  @IsOptional()
  customer_id?: number;
}
