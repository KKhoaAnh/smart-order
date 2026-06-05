import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Table } from './table.entity';
import { Order } from './order.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_id: number;

  @Column({ length: 255, unique: true })
  session_token: string;

  @Column({ length: 255, nullable: true })
  device_fingerprint: string;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'EXPIRED'],
    default: 'ACTIVE',
  })
  status: string;

  @CreateDateColumn()
  opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  // ── Relations ──
  @ManyToOne(() => Table, (table) => table.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @OneToMany(() => Order, (order) => order.session)
  orders: Order[];

  @OneToMany(() => ServiceRequest, (sr) => sr.session)
  service_requests: ServiceRequest[];
}
