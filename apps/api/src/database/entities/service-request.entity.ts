import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Table } from './table.entity';
import { TableSession } from './table-session.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_id: number;

  @Column()
  session_id: number;

  @Column({
    type: 'enum',
    enum: ['CALL_STAFF', 'REQUEST_BILL', 'OTHER'],
  })
  request_type: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACKNOWLEDGED', 'RESOLVED'],
    default: 'PENDING',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  // ── Relations ──
  @ManyToOne(() => Table, (table) => table.service_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => TableSession, (session) => session.service_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: TableSession;
}
