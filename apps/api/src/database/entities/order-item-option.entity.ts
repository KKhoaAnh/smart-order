import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Option } from './option.entity';

@Entity('order_item_options')
export class OrderItemOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_item_id: number;

  @Column()
  option_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price: number;

  // ── Relations ──
  @ManyToOne(() => OrderItem, (item) => item.selected_options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderItem;

  @ManyToOne(() => Option, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'option_id' })
  option: Option;
}
