import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_id: number;

  @Column({
    type: 'enum',
    enum: ['CASH'],
    default: 'CASH',
  })
  payment_method: string;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  // ── Relations ──
  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
