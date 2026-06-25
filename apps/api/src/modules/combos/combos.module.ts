import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';
import { Combo } from '../../database/entities/combo.entity';
import { ComboItem } from '../../database/entities/combo-item.entity';
import { Product } from '../../database/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Combo, ComboItem, Product]),
  ],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}
