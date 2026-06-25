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
import { CombosService } from './combos.service';
import { CreateComboDto, UpdateComboDto } from './dto/create-combo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  // ── Admin: Tạo combo mới ──
  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateComboDto,
  ) {
    return this.combosService.create(storeId, dto);
  }

  // ── Admin: Danh sách combo ──
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.combosService.findAllByStore(storeId);
  }

  // ── Public: Combo đang bán (cho Customer) ──
  @Get('store/:storeId/active')
  getActive(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.combosService.getActiveByStore(storeId);
  }

  // ── Admin: Chi tiết combo ──
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.findOne(id);
  }

  // ── Admin: Cập nhật combo ──
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComboDto,
  ) {
    return this.combosService.update(id, dto);
  }

  // ── Admin: Xóa combo ──
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.remove(id);
  }
}
