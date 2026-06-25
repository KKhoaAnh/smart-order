'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// Cart Store — Giỏ hàng khách hàng (persist localStorage)
// ============================================================

export interface CartItemOption {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number;
  variantName?: string;
  basePrice: number;
  variantAdjustment: number;
  selectedOptions: CartItemOption[];
  quantity: number;
  note?: string;
  unitPrice: number;
  subtotal: number;
  // Combo fields
  isCombo?: boolean;
  comboId?: number;
  comboName?: string;
  comboImage?: string;
  comboBasePrice?: number;
  comboSubItems?: ComboCartSubItem[];
}

export interface ComboCartSubItem {
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number;
  variantName?: string;
  variantAdjustment: number;
  selectedOptions: CartItemOption[];
  optionsTotal: number;
}

export type CartItemInput = Omit<CartItem, 'id' | 'unitPrice' | 'subtotal'>;

interface CartState {
  // State
  items: CartItem[];

  // Computed
  getTotalItems: () => number;
  getTotalAmount: () => number;

  // Actions
  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  clearCart: () => void;
}

/**
 * Tạo unique ID cho cart item dựa trên product, variant và options
 */
function generateCartItemId(
  productId: number,
  variantId?: number,
  optionIds?: number[],
): string {
  const sortedOptions = optionIds ? [...optionIds].sort((a, b) => a - b).join(',') : '';
  return `${productId}-${variantId ?? 'default'}-${sortedOptions}`;
}

/**
 * Tính giá đơn vị = basePrice + variantAdjustment + tổng giá options
 */
function computeUnitPrice(
  basePrice: number,
  variantAdjustment: number,
  options: CartItemOption[],
): number {
  const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
  return basePrice + variantAdjustment + optionsTotal;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],

      // Computed getters
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.subtotal, 0);
      },

      // Actions
      addItem: (input) => {
        // Combo items always get unique IDs (no merging)
        if (input.isCombo && input.comboId) {
          const id = `combo-${input.comboId}-${Date.now()}`;
          // Compute combo unit price = comboBasePrice + variant upgrades + toppings
          let extraCost = 0;
          if (input.comboSubItems) {
            for (const sub of input.comboSubItems) {
              if (sub.variantAdjustment > 0) extraCost += sub.variantAdjustment;
              extraCost += sub.optionsTotal;
            }
          }
          const unitPrice = (input.comboBasePrice || input.basePrice) + extraCost;
          const newItem: CartItem = {
            ...input,
            id,
            unitPrice,
            subtotal: unitPrice * input.quantity,
          };
          set((state) => ({ items: [...state.items, newItem] }));
          return;
        }

        // Regular product item
        const optionIds = input.selectedOptions.map((o) => o.id);
        const id = generateCartItemId(input.productId, input.variantId, optionIds);
        const unitPrice = computeUnitPrice(
          input.basePrice,
          input.variantAdjustment,
          input.selectedOptions,
        );

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id);

          if (existingIndex >= 0) {
            // Sản phẩm đã tồn tại → tăng số lượng
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQuantity = existing.quantity + input.quantity;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              subtotal: unitPrice * newQuantity,
              note: input.note || existing.note,
            };
            return { items: updatedItems };
          }

          // Sản phẩm mới
          const newItem: CartItem = {
            ...input,
            id,
            unitPrice,
            subtotal: unitPrice * input.quantity,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          // Xóa nếu số lượng <= 0
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, subtotal: item.unitPrice * quantity }
              : item,
          ),
        }));
      },

      updateNote: (id, note) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, note } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'smart-order-cart',
    },
  ),
);
