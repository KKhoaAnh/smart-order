import { IsInt } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  product_id: number;
}
