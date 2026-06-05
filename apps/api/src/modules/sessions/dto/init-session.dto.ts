import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class InitSessionDto {
  @IsString()
  @IsNotEmpty()
  qr_token: string;

  @IsString()
  @IsOptional()
  device_fingerprint?: string;
}
