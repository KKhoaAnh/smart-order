// ============================================================
// Smart Order QR — WebSocket Gateway
// Xử lý real-time events giữa Customer App ↔ API ↔ POS/Kitchen
// ============================================================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// Room naming conventions:
// - store:{storeId}          → POS/Kitchen nhận tất cả events của store
// - store:{storeId}:kitchen  → Chỉ Kitchen nhận
// - session:{sessionToken}   → Customer nhận updates cho phiên của mình

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('OrderGateway');

  // Track connected clients
  private connectedClients = new Map<string, { rooms: string[]; type: string }>();

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { rooms: [], type: 'unknown' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // ── Client → Server: Join Rooms ──

  @SubscribeMessage('join_store_room')
  handleJoinStoreRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { store_id: number; role?: string },
  ) {
    const room = `store:${data.store_id}`;
    client.join(room);

    // Nếu là Kitchen, join thêm kitchen room
    if (data.role === 'Kitchen') {
      const kitchenRoom = `store:${data.store_id}:kitchen`;
      client.join(kitchenRoom);
    }

    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms.push(room);
      clientInfo.type = 'pos';
    }

    this.logger.log(`Client ${client.id} joined room: ${room} (role: ${data.role || 'N/A'})`);

    return { event: 'joined', data: { room, message: `Đã kết nối vào store ${data.store_id}` } };
  }

  @SubscribeMessage('join_session_room')
  handleJoinSessionRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { session_token: string },
  ) {
    const room = `session:${data.session_token}`;
    client.join(room);

    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms.push(room);
      clientInfo.type = 'customer';
    }

    this.logger.log(`Client ${client.id} joined session room: ${room}`);

    return { event: 'joined', data: { room, message: 'Đã kết nối phiên order' } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);

    return { event: 'left', data: { room: data.room } };
  }

  // ── Server → Client: Emit Events ──
  // Các methods này được gọi từ Services (OrdersService, ServiceRequestsService, etc.)

  /**
   * Đơn hàng mới — gửi cho POS/Cashier
   */
  emitNewOrder(storeId: number, orderData: any) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('new_order', {
      type: 'NEW_ORDER',
      data: orderData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`📦 new_order emitted to ${room}`);
  }

  /**
   * Khách gọi thêm món — gửi cho POS + Kitchen
   */
  emitOrderItemsAdded(storeId: number, orderData: any) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('order_items_added', {
      type: 'ORDER_ITEMS_ADDED',
      data: orderData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`➕ order_items_added emitted to ${room}`);
  }

  /**
   * Trạng thái đơn thay đổi — gửi cho Customer
   */
  emitOrderStatusChanged(sessionToken: string, orderData: any) {
    const room = `session:${sessionToken}`;
    this.server.to(room).emit('order_status_changed', {
      type: 'ORDER_STATUS_CHANGED',
      data: orderData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`🔄 order_status_changed emitted to ${room}`);
  }

  /**
   * Trạng thái món thay đổi — gửi cho cả Customer + POS
   */
  emitItemStatusChanged(storeId: number, sessionToken: string, itemData: any) {
    // Gửi cho Customer
    const sessionRoom = `session:${sessionToken}`;
    this.server.to(sessionRoom).emit('item_status_changed', {
      type: 'ITEM_STATUS_CHANGED',
      data: itemData,
      timestamp: new Date().toISOString(),
    });

    // Gửi cho POS (để Kitchen/Waiter cùng thấy)
    const storeRoom = `store:${storeId}`;
    this.server.to(storeRoom).emit('item_status_changed', {
      type: 'ITEM_STATUS_CHANGED',
      data: itemData,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`🍳 item_status_changed emitted to ${sessionRoom} + ${storeRoom}`);
  }

  /**
   * Thanh toán hoàn tất — gửi cho Customer
   */
  emitPaymentCompleted(sessionToken: string, paymentData: any) {
    const room = `session:${sessionToken}`;
    this.server.to(room).emit('payment_completed', {
      type: 'PAYMENT_COMPLETED',
      data: paymentData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`💰 payment_completed emitted to ${room}`);
  }

  /** Trạng thái bàn thay đổi — gửi cho POS */
  emitTableStatusChanged(storeId: number, tableData: { table_id: number; status: string; table_number?: string }) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('table_status_changed', {
      type: 'TABLE_STATUS_CHANGED',
      data: tableData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`🪑 table_status_changed emitted to ${room}`);
  }

  /**
   * Khách gọi nhân viên — gửi cho POS/Waiter
   */
  emitServiceRequest(storeId: number, requestData: any) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('service_request_created', {
      type: 'SERVICE_REQUEST',
      data: requestData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`🔔 service_request emitted to ${room}`);
  }

  /**
   * Khuyến mãi được sử dụng — cập nhật POS promotions dashboard
   */
  emitPromotionUsageUpdated(
    storeId: number,
    data: { promotion_id: number; usage_count: number; discount_amount: number },
  ) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('promotion_usage_updated', {
      type: 'PROMOTION_USAGE_UPDATED',
      data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`🎟️ promotion_usage_updated emitted to ${room}`);
  }

  /**
   * Menu cập nhật — gửi cho tất cả Customer trong store
   */
  emitMenuUpdated(storeId: number) {
    const room = `store:${storeId}`;
    this.server.to(room).emit('menu_updated', {
      type: 'MENU_UPDATED',
      data: { store_id: storeId },
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`📋 menu_updated emitted to ${room}`);
  }

  /**
   * Lấy thống kê connections
   */
  getConnectionStats() {
    const stats = {
      total: this.connectedClients.size,
      pos: 0,
      customer: 0,
      unknown: 0,
    };
    this.connectedClients.forEach((info) => {
      if (info.type === 'pos') stats.pos++;
      else if (info.type === 'customer') stats.customer++;
      else stats.unknown++;
    });
    return stats;
  }
}
