'use client';

import { create } from 'zustand';

/* ============================================================
   Order Store — Quản lý đơn hàng POS
   ============================================================ */

export interface POSOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
  note?: string;
  order_round: number;
  item_status: string;
  options?: { id: number; option_name: string; price: number }[];
}

export interface POSOrder {
  id: number;
  order_number: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  note?: string;
  reject_reason?: string;
  table_id: number;
  table_number?: string;
  table_area?: string;
  store_id: number;
  session_id?: number;
  items: POSOrderItem[];
  created_at: string;
  updated_at?: string;
}

interface OrderFilter {
  status?: string;
  search?: string;
}

interface OrderState {
  orders: POSOrder[];
  selectedOrderId: number | null;
  filter: OrderFilter;

  setOrders: (orders: POSOrder[]) => void;
  addOrder: (order: POSOrder) => void;
  updateOrder: (order: POSOrder) => void;
  removeOrder: (id: number) => void;
  setSelectedOrderId: (id: number | null) => void;
  setFilter: (filter: Partial<OrderFilter>) => void;
  getOrdersByStatus: (status: string) => POSOrder[];
  getSelectedOrder: () => POSOrder | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrderId: null,
  filter: {},

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set((state) => {
      const exists = state.orders.find((o) => o.id === order.id);
      if (exists) {
        return { orders: state.orders.map((o) => (o.id === order.id ? order : o)) };
      }
      return { orders: [order, ...state.orders] };
    }),

  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? { ...o, ...order } : o)),
    })),

  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  setSelectedOrderId: (id) => set({ selectedOrderId: id }),

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  getOrdersByStatus: (status) => get().orders.filter((o) => o.order_status === status),

  getSelectedOrder: () => {
    const { orders, selectedOrderId } = get();
    return orders.find((o) => o.id === selectedOrderId);
  },
}));
