import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { Table } from '../../database/entities/table.entity';
import { TableSession } from '../../database/entities/table-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table, TableSession])],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
