'use client';

import { useState, useCallback } from 'react';
import { createOrder, addOrderItems, getOrdersBySession, getOrderDetail } from '../lib/api';
import { useCartStore } from '../store/cart-store';
import { useSessionStore } from '../store/session-store';
import { useOrderStore } from '../store/order-store';
import { useCustomerAuthStore } from '../store/customer-auth-store';
import type { CreateOrderItemDto, ComboOrderItemDto } from 'shared-types';
import toast from 'react-hot-toast';

interface UseOrderReturn {
  submitOrder: (couponCode?: string) => Promise<number | null>;
  addMoreItems: () => Promise<boolean>;
  fetchOrdersBySession: () => Promise<void>;
  fetchOrderDetail: (orderId: number) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function useOrder(): UseOrderReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sessionToken } = useSessionStore();
  const { items: cartItems, clearCart } = useCartStore();
  const { currentOrder, setOrder, setLoading } = useOrderStore();
  const { customer, isAuthenticated } = useCustomerAuthStore();

  // Convert regular cart items to API format (exclude combos)
  const cartToOrderItems = useCallback((): CreateOrderItemDto[] => {
    return cartItems
      .filter((item) => !item.isCombo)
      .map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId || undefined,
        quantity: item.quantity,
        note: item.note || undefined,
        option_ids: item.selectedOptions.map((opt) => opt.id),
      }));
  }, [cartItems]);

  // Convert combo cart items to API format
  const cartToCombos = useCallback((): ComboOrderItemDto[] => {
    return cartItems
      .filter((item) => item.isCombo && item.comboId)
      .flatMap((item) => {
        // For each quantity, create a separate combo order
        return Array.from({ length: item.quantity }, () => ({
          combo_id: item.comboId!,
          items: (item.comboSubItems || []).map((sub) => ({
            product_id: sub.productId,
            variant_id: sub.variantId || undefined,
            quantity: 1,
            option_ids: sub.selectedOptions.map((opt) => opt.id),
          })),
        }));
      });
  }, [cartItems]);

  // Submit a new order
  const submitOrder = useCallback(async (couponCode?: string): Promise<number | null> => {
    if (!sessionToken) {
      toast.error('Phiên đặt món đã hết hạn');
      return null;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const regularItems = cartToOrderItems();
      const combos = cartToCombos();

      const orderData = await createOrder({
        session_token: sessionToken,
        items: regularItems,
        customer_id: isAuthenticated && customer ? customer.id : undefined,
        coupon_code: couponCode || undefined,
        combos: combos.length > 0 ? combos : undefined,
      });

      // Map response to TrackedOrder
      const tracked = mapOrderResponse(orderData);
      setOrder(tracked);

      clearCart();
      toast.success(`Đơn hàng ${tracked.orderNumber} đã được gửi!`);

      return tracked.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể đặt đơn hàng';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionToken, cartItems, cartToOrderItems, cartToCombos, clearCart, setOrder, customer, isAuthenticated]);

  // Add more items to existing order
  const addMoreItems = useCallback(async (): Promise<boolean> => {
    if (!sessionToken || !currentOrder) {
      toast.error('Không tìm thấy đơn hàng hiện tại');
      return false;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedOrder = await addOrderItems(currentOrder.id, {
        session_token: sessionToken,
        items: cartToOrderItems(),
      });

      const tracked = mapOrderResponse(updatedOrder);
      setOrder(tracked);

      clearCart();
      toast.success('Đã gọi thêm món thành công!');

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể gọi thêm món';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionToken, currentOrder, cartItems, cartToOrderItems, clearCart, setOrder]);

  // Fetch all orders for current session
  const fetchOrdersBySession = useCallback(async () => {
    if (!sessionToken) return;

    setLoading(true);
    try {
      const orders = await getOrdersBySession(sessionToken);
      if (orders && orders.length > 0) {
        // Get the most recent active order
        const activeOrder = orders[0];
        const tracked = mapOrderResponse(activeOrder);
        setOrder(tracked);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, setOrder, setLoading]);

  // Fetch single order detail
  const fetchOrderDetail = useCallback(async (orderId: number) => {
    setLoading(true);
    try {
      const orderData = await getOrderDetail(orderId);
      const tracked = mapOrderResponse(orderData);
      setOrder(tracked);
    } catch (err: unknown) {
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  }, [setOrder, setLoading]);

  return {
    submitOrder,
    addMoreItems,
    fetchOrdersBySession,
    fetchOrderDetail,
    isSubmitting,
    error,
  };
}

// Helper: Map API order response to TrackedOrder format
function mapOrderResponse(data: any) {
  return {
    id: data.id,
    orderNumber: data.order_number || data.orderNumber || `#${data.id}`,
    status: data.order_status || data.status || 'PENDING',
    paymentStatus: data.payment_status || data.paymentStatus || 'UNPAID',
    totalAmount: data.total_amount || data.totalAmount || 0,
    discountAmount: data.discount_amount || data.discountAmount || 0,
    finalAmount:
      data.final_amount ||
      data.finalAmount ||
      data.total_amount ||
      data.totalAmount ||
      0,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    items: (data.items || data.order_items || []).map((item: any) => ({
      id: item.id,
      productName: item.product?.name || item.productName || item.product_name || '',
      variantName: item.variant?.variant_name || item.variantName || item.variant_name || undefined,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      note: item.note || undefined,
      orderRound: item.order_round || item.orderRound || 1,
      itemStatus: item.item_status || item.itemStatus || 'PENDING',
      cookingStartedAt: item.cooking_started_at || item.cookingStartedAt || undefined,
      options: (item.options || item.order_item_options || []).map((opt: any) => ({
        name: opt.option?.option_name || opt.name || opt.option_name || '',
        price: opt.price || 0,
      })),
    })),
  };
}
