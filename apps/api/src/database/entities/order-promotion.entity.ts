import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Promotion } from './promotion.entity';

@Entity('order_promotions')
export class OrderPromotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  promotion_id: number;

  @Column({ length: 50, nullable: true })
  code_used: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  discount_amount: number;

  @CreateDateColumn()
  created_at: Date;

  // ── Relations ──
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Promotion, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;
}
