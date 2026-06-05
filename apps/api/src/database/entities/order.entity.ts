import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Table } from './table.entity';
import { TableSession } from './table-session.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column()
  table_id: number;

  @Column()
  session_id: number;

  @Column({ length: 20 })
  order_number: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  })
  order_status: string;

  @Column({
    type: 'enum',
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID',
  })
  payment_status: string;

  @Column({ length: 255, nullable: true })
  reject_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ── Relations ──
  @ManyToOne(() => Store, (store) => store.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Table, (table) => table.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => TableSession, (session) => session.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: TableSession;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}
