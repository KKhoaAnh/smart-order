'use client';

import { useEffect } from 'react';
import {
  connectSocket,
  acquireSocket,
  releaseSocket,
  joinStoreRoom,
  onNewOrder,
  onOrderItemsAdded,
  onItemStatusChanged,
  onPaymentCompleted,
  onServiceRequestCreated,
  removeAllSocketListeners,
} from '@/app/lib/socket';
import { useOrderStore } from '@/app/stores/orderStore';
import toast from 'react-hot-toast';

/** Unwrap socket payload: backend gửi { type, data, timestamp } */
function unwrap(payload: any): any {
  return payload?.data ?? payload;
}

/** Normalize order data từ socket để khớp với store format */
function normalizeOrder(raw: any): any {
  if (!raw || !raw.id) return raw;
  return {
    ...raw,
    total_amount: Number(raw.total_amount) || 0,
    created_at: raw.created_at || new Date().toISOString(),
    items: (raw.items || []).map((item: any) => ({
      ...item,
      price: Number(item.price) || 0,
      subtotal: Number(item.subtotal) || 0,
      quantity: Number(item.quantity) || 0,
    })),
  };
}

export function useSocket(storeId: number | undefined) {
  const { addOrder, updateOrder } = useOrderStore();

  useEffect(() => {
    if (!storeId) return;

    acquireSocket();
    connectSocket();
    joinStoreRoom(storeId);

    onNewOrder((payload) => {
      const order = normalizeOrder(unwrap(payload));
      addOrder(order);
      const orderNum = order.order_number
        ? String(order.order_number).padStart(3, '0')
        : order.id;
      toast.success(`Đơn mới #${orderNum}`, {
        icon: '🔔',
      });
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRl9vT19teleXN0AUAAIBAAAEAB//AAIAAAQATIRBQQAAAA=='
        );
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
    });

    onOrderItemsAdded((payload) => {
      const data = unwrap(payload);
      if (data?.id) updateOrder(data);
      toast('Gọi thêm món', { icon: '🍽️' });
    });

    onItemStatusChanged((payload) => {
      const data = unwrap(payload);
      if (data?.order_id) {
        updateOrder({ id: data.order_id, ...data } as any);
      }
    });

    onPaymentCompleted((payload) => {
      const data = unwrap(payload);
      if (data?.order_id) {
        updateOrder({ id: data.order_id, payment_status: 'PAID', order_status: 'COMPLETED' } as any);
      }
      toast.success('Thanh toán hoàn tất');
    });

    onServiceRequestCreated(() => {
      toast('Yêu cầu phục vụ mới', { icon: '🔔' });
    });

    return () => {
      removeAllSocketListeners();
      releaseSocket();
    };
  }, [storeId, addOrder, updateOrder]);
}

export default useSocket;
