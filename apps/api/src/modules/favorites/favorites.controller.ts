import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // ── Thêm yêu thích ──
  @Post()
  @UseGuards(CustomerJwtGuard)
  create(
    @CurrentCustomer('sub') customerId: number,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoritesService.create(customerId, dto.product_id);
  }

  // ── Bỏ yêu thích ──
  @Delete(':productId')
  @UseGuards(CustomerJwtGuard)
  remove(
    @CurrentCustomer('sub') customerId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favoritesService.remove(customerId, productId);
  }

  // ── Lấy danh sách yêu thích ──
  @Get()
  @UseGuards(CustomerJwtGuard)
  getAll(@CurrentCustomer('sub') customerId: number) {
    return this.favoritesService.getAll(customerId);
  }

  // ── Lấy danh sách product IDs yêu thích ──
  @Get('ids')
  @UseGuards(CustomerJwtGuard)
  getIds(@CurrentCustomer('sub') customerId: number) {
    return this.favoritesService.getFavoriteProductIds(customerId);
  }
}
