import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../database/entities/store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async getStore(id: number) {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Cửa hàng không tồn tại');
    return store;
  }

  async getDefaultStore() {
    // Single-store: luôn trả về store đầu tiên
    const store = await this.storeRepo.findOne({ where: { status: 'ACTIVE' } });
    if (!store) throw new NotFoundException('Chưa cấu hình cửa hàng');
    return store;
  }

  async updateStore(id: number, data: Partial<Store>) {
    const store = await this.getStore(id);
    Object.assign(store, data);
    return this.storeRepo.save(store);
  }
}
