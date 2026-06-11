import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/customer-auth.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';
import { CurrentCustomer } from './decorators/current-customer.decorator';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.customerAuthService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.customerAuthService.login(dto);
  }

  @Get('profile')
  @UseGuards(CustomerJwtGuard)
  getProfile(@CurrentCustomer('sub') customerId: number) {
    return this.customerAuthService.getProfile(customerId);
  }

  @Patch('profile')
  @UseGuards(CustomerJwtGuard)
  updateProfile(
    @CurrentCustomer('sub') customerId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.customerAuthService.updateProfile(customerId, dto);
  }
}
