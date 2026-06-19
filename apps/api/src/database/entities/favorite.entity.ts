import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Product } from './product.entity';

@Entity('favorites')
@Unique(['customer_id', 'product_id'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  product_id: number;

  @CreateDateColumn()
  created_at: Date;

  // ── Relations ──
  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
