import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../../database/entities/table.entity';
import { TableSession } from '../../database/entities/table-session.entity';
import { CreateTableDto, UpdateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
  ) {}

  /**
   * Đồng bộ trạng thái bàn theo session thực tế:
   * - Có session ACTIVE → OCCUPIED
   * - Không có session ACTIVE + đang OCCUPIED → AVAILABLE (đã thanh toán / khách rời)
   * - CLEANING giữ nguyên cho đến khi nhân viên đánh dấu trống
   */
  async syncTableStatus(tableId: number): Promise<Table> {
    const table = await this.tableRepo.findOne({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Bàn không tồn tại');

    const activeCount = await this.sessionRepo.count({
      where: { table_id: tableId, status: 'ACTIVE' },
    });

    if (activeCount > 0) {
      if (table.status !== 'OCCUPIED') {
        table.status = 'OCCUPIED';
        return this.tableRepo.save(table);
      }
    } else if (table.status === 'OCCUPIED') {
      table.status = 'AVAILABLE';
      return this.tableRepo.save(table);
    }

    return table;
  }

  async findAll(storeId: number) {
    const tables = await this.tableRepo.find({
      where: { store_id: storeId },
      relations: ['sessions'],
      order: { table_number: 'ASC' },
    });

    // Sửa dữ liệu cũ: bàn OCCUPIED nhưng không còn session ACTIVE
    for (const table of tables) {
      await this.syncTableStatus(table.id);
    }

    return this.tableRepo.find({
      where: { store_id: storeId },
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

    // Nhân viên đánh dấu trống / dọn dẹp → đóng phiên ACTIVE còn sót (tránh sync kéo lại OCCUPIED)
    if (status === 'AVAILABLE' || status === 'CLEANING') {
      await this.sessionRepo.update(
        { table_id: id, status: 'ACTIVE' },
        { status: 'EXPIRED', closed_at: new Date() },
      );
    }

    table.status = status;
    return this.tableRepo.save(table);
  }
}
