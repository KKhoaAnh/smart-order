import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ── Public (cho Customer App) ──

  @Get('store/:storeId')
  async getFullMenu(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.menuService.getFullMenu(storeId);
  }

  @Get('options')
  async getAllOptions() {
    return this.menuService.getAllOptions();
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getProduct(id);
  }

  // ── Admin: Categories ──

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('categories/:storeId')
  async getCategories(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.menuService.getCategories(storeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post('categories/:storeId')
  async createCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.createCategory(storeId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteCategory(id);
  }

  // ── Admin: Products ──

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.menuService.createProduct(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('products/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.menuService.updateProduct(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('products/:id/toggle-availability')
  async toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.toggleAvailability(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('products/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteProduct(id);
  }
}
