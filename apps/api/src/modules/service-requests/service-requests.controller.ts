import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly srService: ServiceRequestsService) {}

  // Customer: Gọi nhân viên / Yêu cầu tính tiền
  @Post()
  async create(@Body() dto: CreateServiceRequestDto, @Req() req: Request) {
    return this.srService.create(dto, req.ip);
  }

  // POS: Lấy danh sách yêu cầu
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier', 'Waiter')
  @Get('store/:storeId')
  async findByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('status') status?: string,
  ) {
    return this.srService.findByStore(storeId, status);
  }

  // POS: Đã nhận yêu cầu
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier', 'Waiter')
  @Patch(':id/acknowledge')
  async acknowledge(@Param('id', ParseIntPipe) id: number) {
    return this.srService.acknowledge(id);
  }

  // POS: Đã xử lý xong
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier', 'Waiter')
  @Patch(':id/resolve')
  async resolve(@Param('id', ParseIntPipe) id: number) {
    return this.srService.resolve(id);
  }
}
