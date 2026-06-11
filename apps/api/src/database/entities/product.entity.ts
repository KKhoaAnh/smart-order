import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { Option } from './option.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category_id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  base_price: number;

  @Column({ length: 500, nullable: true })
  image_url: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ default: false })
  is_popular: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  avg_rating: number;

  @Column({ default: 0 })
  review_count: number;

  @Column({ nullable: true })
  preparation_time: number;

  @CreateDateColumn()
  created_at: Date;

  // ── Relations ──
  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @ManyToMany(() => Option, (option) => option.products, { cascade: true })
  @JoinTable({
    name: 'product_options',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'option_id', referencedColumnName: 'id' },
  })
  options: Option[];
}
