import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async create(storeId: number, type: string, referenceId: number) {
    const notif = new Notification();
    notif.store_id = storeId;
    notif.type = type;
    notif.reference_id = referenceId;
    notif.is_read = false;
    return this.notifRepo.save(notif);
  }

  async findByStore(storeId: number, unreadOnly = false) {
    const where: any = { store_id: storeId };
    if (unreadOnly) where.is_read = false;

    return this.notifRepo.find({
      where,
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: number) {
    await this.notifRepo.update(id, { is_read: true });
    return { message: 'Đã đánh dấu đã đọc' };
  }

  async markAllAsRead(storeId: number) {
    await this.notifRepo.update(
      { store_id: storeId, is_read: false },
      { is_read: true },
    );
    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  async getUnreadCount(storeId: number) {
    const count = await this.notifRepo.count({
      where: { store_id: storeId, is_read: false },
    });
    return { count };
  }
}
