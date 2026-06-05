import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { TableSession } from '../../database/entities/table-session.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OrderGateway } from '../websocket/order.gateway';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
    private readonly orderGateway: OrderGateway,
  ) {}

  async create(dto: CreateServiceRequestDto, ipAddress?: string) {
    const session = await this.sessionRepo.findOne({
      where: { session_token: dto.session_token, status: 'ACTIVE' },
      relations: ['table'],
    });
    if (!session) {
      throw new BadRequestException('Phiên đã hết hạn hoặc không hợp lệ');
    }

    // Kiểm tra xem có yêu cầu PENDING nào chưa xử lý không
    const pending = await this.srRepo.findOne({
      where: { session_id: session.id, status: 'PENDING' },
    });
    if (pending) {
      throw new BadRequestException('Bạn đã có yêu cầu đang chờ xử lý');
    }

    const sr = new ServiceRequest();
    sr.table_id = session.table_id;
    sr.session_id = session.id;
    sr.request_type = dto.request_type;
    sr.message = dto.message || '';
    sr.status = 'PENDING';
    const saved = await this.srRepo.save(sr);

    // WebSocket: Thông báo POS có yêu cầu mới
    this.orderGateway.emitServiceRequest(session.table.store_id, {
      ...saved,
      table_number: session.table.table_number,
    });

    return saved;
  }

  async findByStore(storeId: number, status?: string) {
    const qb = this.srRepo
      .createQueryBuilder('sr')
      .innerJoinAndSelect('sr.table', 'table')
      .where('table.store_id = :storeId', { storeId })
      .orderBy('sr.created_at', 'DESC');

    if (status) {
      qb.andWhere('sr.status = :status', { status });
    }

    return qb.getMany();
  }

  async acknowledge(id: number) {
    const sr = await this.srRepo.findOne({ where: { id } });
    if (!sr) throw new NotFoundException('Yêu cầu không tồn tại');
    sr.status = 'ACKNOWLEDGED';
    return this.srRepo.save(sr);
  }

  async resolve(id: number) {
    const sr = await this.srRepo.findOne({ where: { id } });
    if (!sr) throw new NotFoundException('Yêu cầu không tồn tại');
    sr.status = 'RESOLVED';
    sr.resolved_at = new Date();
    return this.srRepo.save(sr);
  }
}
