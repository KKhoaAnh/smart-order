import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../../database/entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
  ) {}

  async findAll(storeId: number) {
    return this.tableRepo.find({
      where: { store_id: storeId },
      relations: ['sessions'],
      order: { table_number: 'ASC' },
    });
  }

  async findOne(id: number) {
    const table = await this.tableRepo.findOne({
      where: { id },
      relations: ['sessions'],
    });
    if (!table) throw new NotFoundException('Bàn không tồn tại');
    return table;
  }

  async create(storeId: number, dto: CreateTableDto) {
    const table = new Table();
    table.store_id = storeId;
    table.table_number = dto.table_number;
    table.capacity = dto.capacity || 0;
    table.area = dto.area || '';
    table.qr_code_token = uuidv4();
    table.status = 'AVAILABLE';
    return this.tableRepo.save(table);
  }

  async update(id: number, dto: UpdateTableDto) {
    const table = await this.findOne(id);
    Object.assign(table, dto);
    return this.tableRepo.save(table);
  }

  async remove(id: number) {
    const result = await this.tableRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Bàn không tồn tại');
    return { message: 'Đã xóa bàn' };
  }

  async regenerateQrToken(id: number) {
    const table = await this.findOne(id);
    table.qr_code_token = uuidv4();
    return this.tableRepo.save(table);
  }

  async updateStatus(id: number, status: string) {
    const table = await this.findOne(id);
    table.status = status;
    return this.tableRepo.save(table);
  }
}
