import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('options')
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  option_name: string;

  @Column({
    type: 'enum',
    enum: ['sugar', 'ice', 'topping'],
  })
  option_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price: number;

  // ── Relations ──
  @ManyToMany(() => Product, (product) => product.options)
  products: Product[];
}
