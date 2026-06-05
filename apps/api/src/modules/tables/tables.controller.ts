import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto/create-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Roles('Admin', 'Cashier')
  @Get()
  async findAll(@CurrentUser('store_id') storeId: number) {
    return this.tablesService.findAll(storeId);
  }

  @Roles('Admin', 'Cashier')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Roles('Admin')
  @Post()
  async create(@CurrentUser('store_id') storeId: number, @Body() dto: CreateTableDto) {
    return this.tablesService.create(storeId, dto);
  }

  @Roles('Admin')
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(id, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.remove(id);
  }

  @Roles('Admin')
  @Patch(':id/regenerate-qr')
  async regenerateQr(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.regenerateQrToken(id);
  }

  @Roles('Admin', 'Cashier', 'Waiter')
  @Patch(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.tablesService.updateStatus(id, status);
  }
}
