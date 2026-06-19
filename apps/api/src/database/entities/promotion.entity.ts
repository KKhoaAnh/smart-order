import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Product } from './product.entity';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['PERCENT', 'FIXED', 'FREE_ITEM'],
    default: 'PERCENT',
  })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  value: number;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  min_order_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true })
  max_discount: number;

  @Column({ nullable: true })
  usage_limit: number;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ default: 1 })
  per_customer_limit: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  free_product_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ── Relations ──
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'free_product_id' })
  free_product: Product;
}
