'use client';

import { create } from 'zustand';
import type { OrderStatus, ItemStatus } from 'shared-types';

// ============================================================
// Order Store — Theo dõi đơn hàng hiện tại (real-time)
// ============================================================

export interface TrackedOrderItemOption {
  name: string;
  price: number;
}

export interface TrackedOrderItem {
  id: number;
  productName: string;
  variantName?: string;
  quantity: number;
  price: number;
  subtotal: number;
  note?: string;
  orderRound: number;
  itemStatus: `${ItemStatus}`;
  options: TrackedOrderItemOption[];
}

export interface TrackedOrder {
  id: number;
  orderNumber: string;
  status: `${OrderStatus}`;
  paymentStatus: string;
  items: TrackedOrderItem[];
  totalAmount: number;
  createdAt: string;
}

interface OrderState {
  // State
  currentOrder: TrackedOrder | null;
  isLoading: boolean;

  // Actions
  setOrder: (order: TrackedOrder) => void;
  updateOrderStatus: (status: `${OrderStatus}`) => void;
  updateItemStatus: (itemId: number, status: `${ItemStatus}`) => void;
  clearOrder: () => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  // Initial state
  currentOrder: null,
  isLoading: false,

  // Actions
  setOrder: (order) =>
    set({
      currentOrder: order,
      isLoading: false,
    }),

  updateOrderStatus: (status) =>
    set((state) => {
      if (!state.currentOrder) return state;
      return {
        currentOrder: {
          ...state.currentOrder,
          status,
        },
      };
    }),

  updateItemStatus: (itemId, status) =>
    set((state) => {
      if (!state.currentOrder) return state;
      return {
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.map((item) =>
            item.id === itemId
              ? { ...item, itemStatus: status }
              : item,
          ),
        },
      };
    }),

  clearOrder: () =>
    set({
      currentOrder: null,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));
