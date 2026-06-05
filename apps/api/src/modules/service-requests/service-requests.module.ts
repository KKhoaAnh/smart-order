import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { TableSession } from '../../database/entities/table-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, TableSession])],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
