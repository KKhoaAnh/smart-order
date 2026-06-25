import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { ComboItem } from './combo-item.entity';

@Entity('combos')
export class Combo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  combo_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  original_price: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ── Relations ──
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => ComboItem, (item) => item.combo, { cascade: true })
  items: ComboItem[];
}
