import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(CustomerJwtGuard)
  create(
    @CurrentCustomer('sub') customerId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(customerId, dto);
  }

  @Get('product/:productId')
  getByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getByProduct(productId, page, limit);
  }

  @Get('product/:productId/summary')
  getSummary(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getSummary(productId);
  }

  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  getByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.reviewsService.getByStore(storeId);
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  toggleVisibility(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.toggleVisibility(id);
  }

  @Delete(':id')
  @UseGuards(CustomerJwtGuard)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentCustomer('sub') customerId: number,
  ) {
    return this.reviewsService.delete(id, customerId);
  }
}
