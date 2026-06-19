import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, AddOrderItemsDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Customer: Tạo đơn mới ──
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  // ── Customer: Gọi thêm món ──
  @Post(':id/add-items')
  async addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOrderItemsDto,
  ) {
    return this.ordersService.addItems(id, dto);
  }

  // ── Customer: Xem đơn theo session ──
  @Get('session/:sessionToken')
  async getBySession(@Param('sessionToken') sessionToken: string) {
    return this.ordersService.getOrdersBySession(sessionToken);
  }

  // ── Customer: Lịch sử đơn hàng ──
  @Get('customer/history')
  @UseGuards(CustomerJwtGuard)
  async getCustomerHistory(@CurrentCustomer('sub') customerId: number) {
    return this.ordersService.getCustomerHistory(customerId);
  }

  // ── Customer: Top sản phẩm hay đặt ──
  @Get('customer/frequent')
  @UseGuards(CustomerJwtGuard)
  async getFrequentProducts(@CurrentCustomer('sub') customerId: number) {
    return this.ordersService.getFrequentProducts(customerId);
  }

  // ── Customer/POS: Xem chi tiết đơn ──
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderDetail(id);
  }

  // ── POS: Lấy danh sách đơn theo store ──
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier', 'Kitchen')
  @Get('store/:storeId')
  async getByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.getOrdersByStore(storeId, status);
  }

  // ── POS: Xác nhận / Từ chối đơn ──
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('reject_reason') rejectReason?: string,
  ) {
    return this.ordersService.updateOrderStatus(id, status, rejectReason);
  }

  // ── POS/Kitchen: Cập nhật trạng thái món ──
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier', 'Kitchen')
  @Patch('items/:itemId/status')
  async updateItemStatus(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body('item_status') status: string,
  ) {
    return this.ordersService.updateItemStatus(itemId, status);
  }

  // ── POS: Thanh toán tiền mặt ──
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Cashier')
  @Post(':id/pay')
  async processPayment(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.processPayment(id);
  }
}
