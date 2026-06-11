import { IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(9, 15)
  phone: string;

  @IsString()
  @Length(1, 100)
  name: string;
}

export class LoginDto {
  @IsString()
  @Length(9, 15)
  phone: string;
}

export class UpdateProfileDto {
  @IsString()
  @Length(1, 100)
  name: string;
}
