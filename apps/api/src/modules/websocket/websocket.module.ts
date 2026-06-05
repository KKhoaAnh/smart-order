import { Module, Global } from '@nestjs/common';
import { OrderGateway } from './order.gateway';

@Global() // Global để tất cả modules khác inject được OrderGateway
@Module({
  providers: [OrderGateway],
  exports: [OrderGateway],
})
export class WebsocketModule {}
