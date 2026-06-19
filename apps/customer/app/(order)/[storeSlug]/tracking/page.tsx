'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Bell, Coffee, Heart, Clock } from 'lucide-react';
import { useSessionStore } from '../../../store/session-store';
import { useCustomerAuthStore } from '../../../store/customer-auth-store';
import { useOrderStore } from '../../../store/order-store';
import { useOrder } from '../../../hooks/useOrder';
import { OrderTimeline } from './components/OrderTimeline';
import { OrderItemsList } from './components/OrderItemsList';
import { ServiceRequestPopup } from './components/ServiceRequestPopup';
import { SessionExpired } from '../../../components/states/SessionExpired';
import { formatPrice, formatTime } from '../../../lib/format';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;

  const { isInitialized, tableInfo, storeInfo } = useSessionStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const { currentOrder, isLoading: orderLoading } = useOrderStore();
  const { fetchOrdersBySession } = useOrder();
  const [showServicePopup, setShowServicePopup] = useState(false);

  // Fetch current order on mount
  useEffect(() => {
    if (isInitialized) {
      fetchOrdersBySession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  if (!isInitialized) {
    return <SessionExpired />;
  }

  // Thank you state (payment completed)
  const isPaid = currentOrder?.paymentStatus === 'PAID';
  if (isPaid) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
          style={{ maxWidth: 340 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
              boxShadow: '0 12px 32px rgba(34, 197, 94, 0.3)',
            }}
          >
            <Heart size={42} color="#FFFFFF" fill="#FFFFFF" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 8,
            }}
          >
            Cảm ơn quý khách!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 8, lineHeight: 1.6 }}
          >
            Thanh toán đã hoàn tất. Hẹn gặp lại bạn lần sau!
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ fontSize: 22, fontWeight: 700, color: '#6F4E37', marginBottom: 28 }}
          >
            {formatPrice(currentOrder?.totalAmount || 0)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2"
            style={{ color: '#9CA3AF', fontSize: 13 }}
          >
            <Coffee size={14} />
            <span>{storeInfo?.name}</span>
          </motion.div>

          {/* Nút xem lịch sử đơn hàng */}
          {isAuthenticated && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/${storeSlug}/history`)}
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 12,
                border: '1px solid #E8E0D8',
                backgroundColor: '#FFFFFF',
                color: '#6B6B6B',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Clock size={14} />
              Xem lịch sử đơn hàng
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (orderLoading && !currentOrder) {
    return (
      <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: 16 }}>
        <div style={{ paddingTop: 60 }}>
          <Skeleton variant="rect" height="120px" />
          <div style={{ marginTop: 20 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </div>
          <div style={{ marginTop: 20 }}>
            <Skeleton variant="card" />
            <div style={{ marginTop: 10 }}>
              <Skeleton variant="card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No order found
  if (!currentOrder) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <Coffee size={48} color="#D4B896" strokeWidth={1.5} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginTop: 20, marginBottom: 8 }}>
          Chưa có đơn hàng
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 24 }}>
          Hãy đặt món để bắt đầu nhé!
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
          Xem Menu
        </motion.button>
      </div>
    );
  }

  const isCompleted = currentOrder.status === 'COMPLETED';
  const isCancelled = currentOrder.status === 'CANCELLED';

  return (
    <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', paddingBottom: 100 }}>
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
            onClick={() => router.push(`/${storeSlug}/menu`)}
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

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              Đơn hàng {currentOrder.orderNumber}
            </h1>
            <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
              {tableInfo?.table_number} • {formatTime(currentOrder.createdAt)}
            </p>
          </div>

          <div style={{ width: 30 }} />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            border: '1px solid #E8E0D8',
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(111, 78, 55, 0.05)',
          }}
        >
          <OrderTimeline
            status={
              // Nếu order đang CONFIRMED nhưng có item đang COOKING → hiển thị COOKING trên timeline
              currentOrder.status === 'CONFIRMED' &&
              currentOrder.items.some((item) => item.itemStatus === 'COOKING')
                ? 'COOKING'
                : currentOrder.status
            }
          />
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 12,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Chi tiết đơn hàng
          </h3>

          <OrderItemsList items={currentOrder.items} />

          {/* Total */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              padding: '14px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E8E0D8',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>Tổng cộng</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#6F4E37' }}>
              {formatPrice(currentOrder.totalAmount)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom action buttons */}
      {!isCancelled && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E8E0D8',
            padding: '12px 16px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            zIndex: 50,
            display: 'flex',
            gap: 10,
          }}
        >
          {/* Call staff / request bill */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowServicePopup(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '13px 16px',
              borderRadius: 14,
              border: '1.5px solid #6F4E37',
              backgroundColor: '#FFFFFF',
              color: '#6F4E37',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Bell size={16} />
            Hỗ trợ
          </motion.button>

          {/* Add more items */}
          {!isCompleted && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/${storeSlug}/menu`)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '13px 16px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(111, 78, 55, 0.25)',
              }}
            >
              <Plus size={16} />
              Gọi thêm món
            </motion.button>
          )}
        </div>
      )}

      {/* Service Request Popup */}
      <ServiceRequestPopup
        isOpen={showServicePopup}
        onClose={() => setShowServicePopup(false)}
      />
    </div>
  );
}
