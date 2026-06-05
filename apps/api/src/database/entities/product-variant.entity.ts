import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column({ length: 50 })
  variant_name: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price_adjustment: number;

  @Column({ default: false })
  is_default: boolean;

  // ── Relations ──
  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
