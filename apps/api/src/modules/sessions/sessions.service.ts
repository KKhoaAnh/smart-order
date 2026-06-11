import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../../database/entities/table.entity';
import { TableSession } from '../../database/entities/table-session.entity';
import { InitSessionDto } from './dto/init-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
  ) {}

  async initSession(dto: InitSessionDto, ipAddress?: string) {
    // 1. Validate QR token
    const table = await this.tableRepo.findOne({
      where: { qr_code_token: dto.qr_token },
      relations: ['store'],
    });
    if (!table) {
      throw new NotFoundException('Mã QR không hợp lệ hoặc bàn không tồn tại');
    }

    // 2. Check if table already has an active session
    let activeSession = await this.sessionRepo.findOne({
      where: { table_id: table.id, status: 'ACTIVE' },
    });

    // 3. If active session exists with same device, return it
    if (activeSession && dto.device_fingerprint && activeSession.device_fingerprint === dto.device_fingerprint) {
      return this.buildSessionResponse(activeSession, table);
    }

    // 4. If no active session, create new one
    if (!activeSession) {
      activeSession = new TableSession();
      activeSession.table_id = table.id;
      activeSession.session_token = uuidv4();
      activeSession.device_fingerprint = dto.device_fingerprint || '';
      activeSession.ip_address = ipAddress || '';
      activeSession.status = 'ACTIVE';
      activeSession = await this.sessionRepo.save(activeSession);

      table.status = 'OCCUPIED';
      await this.tableRepo.save(table);
    }

    return this.buildSessionResponse(activeSession, table);
  }

  async validateSession(sessionToken: string) {
    const session = await this.sessionRepo.findOne({
      where: { session_token: sessionToken, status: 'ACTIVE' },
      relations: ['table'],
    });
    if (!session) {
      throw new BadRequestException('Phiên đã hết hạn hoặc không hợp lệ');
    }
    return session;
  }

  async expireSession(sessionId: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['table'],
    });
    if (!session) throw new NotFoundException('Session không tồn tại');

    session.status = 'EXPIRED';
    session.closed_at = new Date();
    await this.sessionRepo.save(session);

    // Update table status
    if (session.table) {
      session.table.status = 'CLEANING';
      await this.tableRepo.save(session.table);
    }

    return { message: 'Phiên đã đóng' };
  }

  private buildSessionResponse(session: TableSession, table: Table) {
    return {
      session_token: session.session_token,
      store: {
        id: table.store.id,
        name: table.store.name,
        logo_url: table.store.logo_url,
        address: table.store.address,
        phone: table.store.phone,
      },
      table: {
        id: table.id,
        table_number: table.table_number,
        area: table.area,
      },
    };
  }
}
