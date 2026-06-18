import { IsString, IsOptional, IsArray, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ, số, dấu chấm và gạch dưới',
  })
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
