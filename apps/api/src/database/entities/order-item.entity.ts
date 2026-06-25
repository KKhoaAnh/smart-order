import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { OrderItemOption } from './order-item-option.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  product_id: number;

  @Column({ nullable: true })
  variant_id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  subtotal: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: 1 })
  order_round: number;

  @Column({ length: 50, nullable: true })
  combo_group_id: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'COOKING', 'SERVED'],
    default: 'PENDING',
  })
  item_status: string;

  /** Thời điểm bếp bấm "Chế biến" — dùng cho đếm thời gian trên app khách */
  @Column({ type: 'timestamp', nullable: true })
  cooking_started_at: Date | null;

  // ── Relations ──
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @OneToMany(() => OrderItemOption, (oio) => oio.order_item, { cascade: true })
  selected_options: OrderItemOption[];
}
