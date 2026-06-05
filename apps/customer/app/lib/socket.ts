'use client';

import { io, Socket } from 'socket.io-client';
import { SocketEvents } from 'shared-types';

/* ============================================================
   Smart Order QR — Socket.IO Client (singleton)
   ============================================================ */

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

/* ============================================================
   Connection Lifecycle
   ============================================================ */

/**
 * Tạo hoặc trả về socket singleton.
 * Chỉ tạo mới nếu chưa kết nối.
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }

  return socket;
}

/**
 * Ngắt kết nối và giải phóng socket.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Lấy socket hiện tại (có thể null nếu chưa connect).
 */
export function getSocket(): Socket | null {
  return socket;
}

/* ============================================================
   Room Management
   ============================================================ */

/**
 * Tham gia phòng theo session token để nhận real-time updates.
 */
export function joinSessionRoom(sessionToken: string): void {
  const s = socket ?? connectSocket();
  s.emit(SocketEvents.JOIN_SESSION_ROOM, { session_token: sessionToken });
}

/* ============================================================
   Event Listeners
   ============================================================ */

/**
 * Lắng nghe khi trạng thái order thay đổi.
 */
export function onOrderStatusChanged(
  callback: (data: any) => void,
): void {
  const s = socket ?? connectSocket();
  s.on(SocketEvents.ORDER_STATUS_CHANGED, callback);
}

/**
 * Lắng nghe khi trạng thái món (item) thay đổi.
 */
export function onItemStatusChanged(
  callback: (data: any) => void,
): void {
  const s = socket ?? connectSocket();
  s.on(SocketEvents.ITEM_STATUS_CHANGED, callback);
}

/**
 * Lắng nghe khi thanh toán hoàn tất.
 */
export function onPaymentCompleted(
  callback: (data: any) => void,
): void {
  const s = socket ?? connectSocket();
  s.on(SocketEvents.PAYMENT_COMPLETED, callback);
}

/**
 * Lắng nghe khi menu được cập nhật.
 */
export function onMenuUpdated(
  callback: (data: any) => void,
): void {
  const s = socket ?? connectSocket();
  s.on(SocketEvents.MENU_UPDATED, callback);
}

/* ============================================================
   Cleanup
   ============================================================ */

/**
 * Gỡ tất cả event listeners (không ngắt kết nối).
 * Hữu ích khi unmount component.
 */
export function removeAllListeners(): void {
  if (socket) {
    socket.off(SocketEvents.ORDER_STATUS_CHANGED);
    socket.off(SocketEvents.ITEM_STATUS_CHANGED);
    socket.off(SocketEvents.PAYMENT_COMPLETED);
    socket.off(SocketEvents.MENU_UPDATED);
  }
}
