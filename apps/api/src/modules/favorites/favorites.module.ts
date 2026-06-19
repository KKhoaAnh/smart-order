import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Favorite } from '../../database/entities/favorite.entity';
import { Product } from '../../database/entities/product.entity';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite, Product]),
    CustomerAuthModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
