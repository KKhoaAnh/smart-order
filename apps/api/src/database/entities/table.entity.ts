import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { TableSession } from './table-session.entity';
import { Order } from './order.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column({ length: 50 })
  table_number: string;

  @Column({ length: 255, unique: true })
  qr_code_token: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ length: 50, nullable: true })
  area: string;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'OCCUPIED', 'CLEANING'],
    default: 'AVAILABLE',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  // ── Relations ──
  @ManyToOne(() => Store, (store) => store.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => TableSession, (session) => session.table)
  sessions: TableSession[];

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  @OneToMany(() => ServiceRequest, (sr) => sr.table)
  service_requests: ServiceRequest[];
}
