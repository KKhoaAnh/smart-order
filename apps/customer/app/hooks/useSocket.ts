'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinSessionRoom,
  onOrderStatusChanged,
  onItemStatusChanged,
  onPaymentCompleted,
  onMenuUpdated,
  removeAllListeners,
} from '../lib/socket';
import { useSessionStore } from '../store/session-store';
import { useOrderStore } from '../store/order-store';
import toast from 'react-hot-toast';


export function useSocket() {
  const { sessionToken } = useSessionStore();
  const { updateOrderStatus, updateItemStatus } = useOrderStore();
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!sessionToken || isConnectedRef.current) return;

    const socket = connectSocket();
    isConnectedRef.current = true;

    // Join session room
    joinSessionRoom(sessionToken);

    // Listen for order status changes
    onOrderStatusChanged((data) => {
      const orderData = data.data || data;
      const newStatus = orderData.order_status || orderData.status;

      if (newStatus) {
        updateOrderStatus(newStatus);

        if (newStatus === 'CONFIRMED') {
          toast.success(`Đơn hàng đã được xác nhận! Bếp đang chuẩn bị...`, {
            icon: '✅',
            duration: 4000,
          });
        } else if (newStatus === 'CANCELLED') {
          toast.error(`Đơn hàng đã bị hủy${orderData.reject_reason ? `: ${orderData.reject_reason}` : ''}`, {
            icon: '❌',
            duration: 6000,
          });
        } else if (newStatus === 'COMPLETED') {
          toast.success('Tất cả món đã được phục vụ!', {
            icon: '🍽️',
            duration: 4000,
          });
        }
      }
    });

    // Listen for item status changes
    onItemStatusChanged((data) => {
      const itemData = data.data || data;
      const itemId = itemData.id || itemData.item_id;
      const newStatus = itemData.item_status || itemData.status;

      if (itemId && newStatus) {
        updateItemStatus(itemId, newStatus);

        if (newStatus === 'COOKING') {
          toast(`${itemData.product_name || 'Món'} đang được chế biến...`, {
            icon: '👨‍🍳',
            duration: 3000,
          });
        } else if (newStatus === 'SERVED') {
          toast.success(`${itemData.product_name || 'Món'} đã được phục vụ!`, {
            icon: '🍽️',
            duration: 3000,
          });
        }
      }
    });

    // Listen for payment completed
    onPaymentCompleted(() => {
      updateOrderStatus('COMPLETED');
      toast.success('Thanh toán hoàn tất! Cảm ơn quý khách! ☕', {
        icon: '💰',
        duration: 5000,
      });
    });

    // Listen for menu updates
    onMenuUpdated(() => {
      toast('Menu đã được cập nhật!', {
        icon: '📋',
        duration: 3000,
      });
    });

    return socket;
  }, [sessionToken, updateOrderStatus, updateItemStatus]);

  const disconnect = useCallback(() => {
    removeAllListeners();
    disconnectSocket();
    isConnectedRef.current = false;
  }, []);

  // Auto-connect when session token is available
  useEffect(() => {
    if (sessionToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [sessionToken, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
  };
}
