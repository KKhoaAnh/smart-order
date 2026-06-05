import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Table } from '../../database/entities/table.entity';
import { TableSession } from '../../database/entities/table-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table, TableSession])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
