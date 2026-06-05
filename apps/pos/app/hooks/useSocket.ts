'use client';

import { useEffect } from 'react';
import {
  connectSocket,
  disconnectSocket,
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

export function useSocket(storeId: number | undefined) {
  const { addOrder, updateOrder } = useOrderStore();

  useEffect(() => {
    if (!storeId) return;

    connectSocket();
    joinStoreRoom(storeId);

    onNewOrder((order) => {
      addOrder(order);
      toast.success(`Đơn mới #${String(order.order_number).padStart(3, '0')}`, {
        icon: '🔔',
      });
      // Play notification sound
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRl9vT19teleXN0AUAAIBAAAEAB//AAIAAAQATIRBQQAAAA=='
        );
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
    });

    onOrderItemsAdded((data) => {
      updateOrder(data);
      toast('Gọi thêm món', { icon: '🍽️' });
    });

    onItemStatusChanged((data) => {
      updateOrder(data);
    });

    onPaymentCompleted((data) => {
      updateOrder(data);
      toast.success('Thanh toán hoàn tất');
    });

    onServiceRequestCreated(() => {
      toast('Yêu cầu phục vụ mới', { icon: '🔔' });
    });

    return () => {
      removeAllSocketListeners();
      disconnectSocket();
    };
  }, [storeId, addOrder, updateOrder]);
}

export default useSocket;
