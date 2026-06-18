'use client';

import { io, Socket } from 'socket.io-client';
import { SocketEvents } from 'shared-types';

/* ============================================================
   Smart Order POS — Socket.IO Client (Singleton)
   ============================================================ */

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let joinedStoreId: number | null = null;
let socketSubscribers = 0;

/* ── Connect / Disconnect ─────────────────────────────────── */

export function connectSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    if (joinedStoreId != null) {
      socket?.emit(SocketEvents.JOIN_STORE_ROOM, { store_id: joinedStoreId });
    }
  });

  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => console.log('[Socket] Connected:', socket?.id));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
  }

  return socket;
}

/** Tăng ref-count; chỉ disconnect khi không còn subscriber nào. */
export function acquireSocket(): void {
  socketSubscribers += 1;
}

export function releaseSocket(): void {
  socketSubscribers = Math.max(0, socketSubscribers - 1);
  if (socketSubscribers === 0) {
    disconnectSocket();
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  joinedStoreId = null;
}

export function getSocket(): Socket | null {
  return socket;
}

/* ── Room Management ──────────────────────────────────────── */

export function joinStoreRoom(storeId: number, role?: string) {
  joinedStoreId = storeId;
  connectSocket();
  if (socket?.connected) {
    socket.emit(SocketEvents.JOIN_STORE_ROOM, { store_id: storeId, role });
  }
}

/* ── Event Listeners ──────────────────────────────────────── */

type EventCallback = (payload: any) => void;

export function onNewOrder(callback: EventCallback) {
  socket?.on(SocketEvents.NEW_ORDER, callback);
}

export function onOrderItemsAdded(callback: EventCallback) {
  socket?.on(SocketEvents.ORDER_ITEMS_ADDED, callback);
}

export function onOrderStatusChanged(callback: EventCallback) {
  socket?.on(SocketEvents.ORDER_STATUS_CHANGED, callback);
}

export function onItemStatusChanged(callback: EventCallback) {
  socket?.on(SocketEvents.ITEM_STATUS_CHANGED, callback);
}

export function onPaymentCompleted(callback: EventCallback) {
  socket?.on(SocketEvents.PAYMENT_COMPLETED, callback);
}

export function onServiceRequestCreated(callback: EventCallback) {
  socket?.on(SocketEvents.SERVICE_REQUEST_CREATED, callback);
}

export function onMenuUpdated(callback: EventCallback) {
  socket?.on(SocketEvents.MENU_UPDATED, callback);
}

export function onTableStatusChanged(callback: EventCallback) {
  socket?.on(SocketEvents.TABLE_STATUS_CHANGED, callback);
}

export function removeAllSocketListeners() {
  const events = [
    SocketEvents.NEW_ORDER,
    SocketEvents.ORDER_ITEMS_ADDED,
    SocketEvents.ORDER_STATUS_CHANGED,
    SocketEvents.ITEM_STATUS_CHANGED,
    SocketEvents.PAYMENT_COMPLETED,
    SocketEvents.SERVICE_REQUEST_CREATED,
    SocketEvents.MENU_UPDATED,
    SocketEvents.TABLE_STATUS_CHANGED,
  ];
  events.forEach((event) => socket?.off(event));
}
