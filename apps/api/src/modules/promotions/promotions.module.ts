import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion } from '../../database/entities/promotion.entity';
import { OrderPromotion } from '../../database/entities/order-promotion.entity';
import { Product } from '../../database/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, OrderPromotion, Product]),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
