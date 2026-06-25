import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Combo } from './combo.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('combo_items')
export class ComboItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  combo_id: number;

  @Column()
  product_id: number;

  @Column({ nullable: true })
  default_variant_id: number;

  @Column({ default: 1 })
  quantity: number;

  // ── Relations ──
  @ManyToOne(() => Combo, (combo) => combo.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'combo_id' })
  combo: Combo;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_variant_id' })
  default_variant: ProductVariant;
}
