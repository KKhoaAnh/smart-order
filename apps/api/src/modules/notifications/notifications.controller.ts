import { Controller, Get, Patch, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Cashier', 'Kitchen', 'Waiter')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  async findByStore(
    @CurrentUser('store_id') storeId: number,
    @Query('unread') unread?: string,
  ) {
    return this.notifService.findByStore(storeId, unread === 'true');
  }

  @Get('count')
  async getUnreadCount(@CurrentUser('store_id') storeId: number) {
    return this.notifService.getUnreadCount(storeId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notifService.markAsRead(id);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('store_id') storeId: number) {
    return this.notifService.markAllAsRead(storeId);
  }
}
