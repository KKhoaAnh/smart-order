'use client';

import { useState, useCallback } from 'react';
import { getStoreOrders, updateOrderStatus, processPayment } from '@/app/lib/api';
import { useOrderStore } from '@/app/stores/orderStore';
import toast from 'react-hot-toast';

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const { setOrders } = useOrderStore();

  const fetchOrders = useCallback(
    async (storeId: number) => {
      setLoading(true);
      try {
        const data = await getStoreOrders(storeId);
        setOrders(data);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi tải đơn hàng');
      } finally {
        setLoading(false);
      }
    },
    [setOrders]
  );

  const confirmOrder = async (orderId: number) => {
    try {
      await updateOrderStatus(orderId, { status: 'CONFIRMED' });
      toast.success('Đã xác nhận đơn hàng');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xác nhận');
    }
  };

  const rejectOrder = async (orderId: number, reason: string) => {
    try {
      await updateOrderStatus(orderId, { status: 'REJECTED', reject_reason: reason });
      toast.success('Đã từ chối đơn hàng');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi từ chối');
    }
  };

  const payOrder = async (orderId: number) => {
    try {
      await processPayment(orderId);
      toast.success('Thanh toán thành công');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thanh toán');
    }
  };

  return { fetchOrders, confirmOrder, rejectOrder, payOrder, loading };
}

export default useOrders;
