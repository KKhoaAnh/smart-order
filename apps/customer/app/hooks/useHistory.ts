'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCustomerAuthStore } from '../store/customer-auth-store';
import { getOrderHistory, getFrequentProducts } from '../lib/api';

// ============================================================
// useHistory — Lịch sử đơn hàng & sản phẩm hay đặt
// ============================================================

interface UseHistoryReturn {
  orders: any[];
  frequentProducts: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const { token, isAuthenticated } = useCustomerAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [frequentProducts, setFrequentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [historyData, frequentData] = await Promise.all([
        getOrderHistory(token),
        getFrequentProducts(token),
      ]);
      setOrders(historyData);
      setFrequentProducts(frequentData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải lịch sử';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    orders,
    frequentProducts,
    isLoading,
    error,
    refetch: fetchData,
  };
}
