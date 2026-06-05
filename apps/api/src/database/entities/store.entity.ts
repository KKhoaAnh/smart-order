import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Table } from './table.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
import { Order } from './order.entity';
import { Notification } from './notification.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 500, nullable: true })
  logo_url: string;

  @Column({ length: 255, nullable: true })
  opening_hours: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ── Relations ──
  @OneToMany(() => Table, (table) => table.store)
  tables: Table[];

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @OneToMany(() => User, (user) => user.store)
  users: User[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => Notification, (notification) => notification.store)
  notifications: Notification[];
}
