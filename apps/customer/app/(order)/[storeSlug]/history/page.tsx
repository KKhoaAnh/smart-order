'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  RotateCcw,
  Coffee,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { useSessionStore } from '../../../store/session-store';
import { useCustomerAuthStore } from '../../../store/customer-auth-store';
import { useCartStore } from '../../../store/cart-store';
import { useHistory } from '../../../hooks/useHistory';
import { SessionExpired } from '../../../components/states/SessionExpired';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatPrice, formatDate, formatTime, getRelativeTime } from '../../../lib/format';
import toast from 'react-hot-toast';

// ── Status helpers ──
const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FFF7ED', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF', icon: CheckCircle2 },
  COMPLETED: { label: 'Hoàn thành', color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
};

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;

  const { isInitialized } = useSessionStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { orders, isLoading, error } = useHistory();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  if (!isInitialized) {
    return <SessionExpired />;
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <Coffee size={48} color="#D4B896" strokeWidth={1.5} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginTop: 20, marginBottom: 8 }}>
          Đăng nhập để xem lịch sử
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 24 }}>
          Hãy đăng nhập để xem lịch sử đơn hàng và đặt lại món yêu thích.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/${storeSlug}/menu`)}
          style={{
            background: 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Quay lại Menu
        </motion.button>
      </div>
    );
  }

  // ── Reorder handler ──
  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    for (const item of order.items) {
      if (!item.product?.is_available) continue;

      addItem({
        productId: item.product_id,
        productName: item.product?.name || 'Sản phẩm',
        productImage: item.product?.image_url,
        variantId: item.variant_id,
        variantName: item.variant?.variant_name,
        basePrice: Number(item.product?.base_price || item.price),
        variantAdjustment: Number(item.variant?.price_adjustment || 0),
        selectedOptions: (item.selected_options || []).map((so: any) => ({
          id: so.option_id,
          name: so.option?.name || '',
          price: Number(so.price),
        })),
        quantity: item.quantity,
        note: item.note,
      });
      addedCount++;
    }

    if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} món vào giỏ hàng 🛒`);
      router.push(`/${storeSlug}/cart`);
    } else {
      toast.error('Không có món nào còn hàng để đặt lại');
    }
  };

  return (
    <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#FAFAF8',
          borderBottom: '1px solid #E8E0D8',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={22} color="#1A1A1A" />
          </button>

          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Lịch sử đơn hàng
          </h1>

          <div style={{ width: 30 }} />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p style={{ fontSize: 14, color: '#DC2626' }}>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <ShoppingBag size={48} color="#D4B896" strokeWidth={1.5} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginTop: 16 }}>
              Chưa có đơn hàng nào
            </h3>
            <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 6 }}>
              Hãy đặt món đầu tiên nhé!
            </p>
          </motion.div>
        )}

        {/* Order list */}
        {!isLoading && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, index) => {
              const status = statusMap[order.order_status] || statusMap.PENDING;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;
              const itemCount = order.items?.length || 0;
              const firstItems = order.items?.slice(0, 3) || [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    border: '1px solid #E8E0D8',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(111, 78, 55, 0.05)',
                  }}
                >
                  {/* Order header — clickable */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                          Đơn hàng #{order.id}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: status.color,
                            backgroundColor: status.bg,
                            padding: '2px 8px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <StatusIcon size={11} />
                          {status.label}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} color="#9CA3AF" />
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
                          {order.table?.table_number && `Bàn ${order.table.table_number} • `}
                          {getRelativeTime(order.created_at)}
                        </p>
                        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
                          {firstItems.map((item: any) => item.product?.name).filter(Boolean).join(', ')}
                          {itemCount > 3 && ` +${itemCount - 3} món`}
                        </p>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#6F4E37' }}>
                        {formatPrice(Number(order.total_amount))}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            borderTop: '1px solid #F3F0ED',
                            padding: '12px 16px',
                          }}
                        >
                          {/* Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                            {order.items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between"
                                style={{ fontSize: 13 }}
                              >
                                <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ color: '#6B6B6B', flexShrink: 0 }}>{item.quantity}x</span>
                                  <span
                                    style={{
                                      color: '#1A1A1A',
                                      fontWeight: 500,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {item.product?.name}
                                    {item.variant?.variant_name && (
                                      <span style={{ color: '#9CA3AF', fontWeight: 400 }}>
                                        {' '}({item.variant.variant_name})
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span style={{ color: '#6B6B6B', flexShrink: 0, marginLeft: 8 }}>
                                  {formatPrice(Number(item.subtotal))}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Date + total */}
                          <div
                            className="flex items-center justify-between"
                            style={{
                              borderTop: '1px dashed #E8E0D8',
                              paddingTop: 10,
                              marginBottom: 12,
                            }}
                          >
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                              <Clock size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
                              {formatDate(order.created_at)} {formatTime(order.created_at)}
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#6F4E37' }}>
                              {formatPrice(Number(order.total_amount))}
                            </span>
                          </div>

                          {/* Reorder button */}
                          {order.order_status === 'COMPLETED' && (
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(order);
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '11px 16px',
                                borderRadius: 12,
                                border: '1.5px solid #6F4E37',
                                backgroundColor: '#FFFFFF',
                                color: '#6F4E37',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              <RotateCcw size={15} />
                              Đặt lại đơn này
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
