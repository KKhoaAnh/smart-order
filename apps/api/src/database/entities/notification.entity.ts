import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column({
    type: 'enum',
    enum: ['NEW_ORDER', 'ORDER_CONFIRMED', 'ORDER_ITEMS_ADDED', 'SERVICE_REQUEST', 'ITEM_STATUS_CHANGED'],
  })
  type: string;

  @Column()
  reference_id: number;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  // ── Relations ──
  @ManyToOne(() => Store, (store) => store.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
