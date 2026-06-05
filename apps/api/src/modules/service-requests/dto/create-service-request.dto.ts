import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  session_token: string;

  @IsEnum(['CALL_STAFF', 'REQUEST_BILL', 'OTHER'])
  request_type: string;

  @IsString()
  @IsOptional()
  message?: string;
}
