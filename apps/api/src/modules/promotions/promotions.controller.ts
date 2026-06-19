import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/create-promotion.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ── Admin: Tạo khuyến mãi mới ──
  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionsService.create(storeId, dto);
  }

  // ── Admin: Lấy danh sách KM ──
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.promotionsService.findAllByStore(storeId);
  }

  // ── Public: KM đang chạy (cho customer banner) ──
  @Get('store/:storeId/active')
  getActive(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.promotionsService.getActiveByStore(storeId);
  }

  // ── Public: Validate mã giảm giá ──
  @Post('validate')
  validate(@Body() dto: ValidateCouponDto) {
    return this.promotionsService.validateCoupon(dto);
  }

  // ── Admin: Chi tiết KM ──
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.findOne(id);
  }

  // ── Admin: Cập nhật KM ──
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, dto);
  }

  // ── Admin: Xóa KM ──
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.remove(id);
  }
}
