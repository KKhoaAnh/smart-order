import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Public: Lấy thông tin quán (cho Customer App)
  @Get()
  async getDefaultStore() {
    return this.storeService.getDefaultStore();
  }

  @Get(':id')
  async getStore(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.getStore(id);
  }

  // Admin: Cập nhật thông tin quán
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id')
  async updateStore(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ name: string; address: string; phone: string; opening_hours: string; logo_url: string }>,
  ) {
    return this.storeService.updateStore(id, body);
  }
}
