import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { OrderItemOption } from '../../database/entities/order-item-option.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Option } from '../../database/entities/option.entity';
import { TableSession } from '../../database/entities/table-session.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Customer } from '../../database/entities/customer.entity';
import { TablesModule } from '../tables/tables.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [
    TablesModule,
    CustomerAuthModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderItemOption,
      Product,
      ProductVariant,
      Option,
      TableSession,
      Payment,
      Customer,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
