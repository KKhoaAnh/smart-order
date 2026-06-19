'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Tag, X, Check } from 'lucide-react';
import { useCartStore } from '../../../store/cart-store';
import { useOrderStore } from '../../../store/order-store';
import { useSessionStore } from '../../../store/session-store';
import { useOrder } from '../../../hooks/useOrder';
import { useCoupon } from '../../../hooks/useCoupon';
import { CartItem } from './components/CartItem';
import { EmptyCart } from '../../../components/states/EmptyCart';
import { formatPrice } from '../../../lib/format';

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;

  const items = useCartStore((s) => s.items);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalAmount = useCartStore((s) => s.getTotalAmount);
  const { currentOrder } = useOrderStore();
  const { storeInfo } = useSessionStore();

  const { submitOrder, addMoreItems, isSubmitting } = useOrder();
  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isValidating,
    error: couponError,
    validateAndApply,
    clearCoupon,
  } = useCoupon();

  const handleGoToMenu = () => {
    router.push(`/${storeSlug}/menu`);
  };

  const handleSubmitOrder = async () => {
    let orderId: number | null = null;

    if (currentOrder && (currentOrder.status === 'PENDING' || currentOrder.status === 'CONFIRMED')) {
      // Add items to existing order
      const success = await addMoreItems();
      if (success) {
        router.push(`/${storeSlug}/tracking`);
      }
    } else {
      // Create new order
      orderId = await submitOrder(appliedCoupon?.code);
      if (orderId) {
        router.push(`/${storeSlug}/tracking`);
      }
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #E8E0D8',
            backgroundColor: '#FAFAF8',
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
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0, flex: 1, textAlign: 'center' }}>
            Giỏ hàng
          </h1>
          <div style={{ width: 30 }} />
        </div>

        <EmptyCart onBrowseMenu={handleGoToMenu} />
      </div>
    );
  }

  const isAddingMore = currentOrder && (currentOrder.status === 'PENDING' || currentOrder.status === 'CONFIRMED');
  const subtotal = getTotalAmount();
  const discountAmount = appliedCoupon?.discount_amount || 0;
  const finalAmount = Math.max(0, subtotal - discountAmount);
  const showCouponSection = !isAddingMore && storeInfo?.id;

  return (
    <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', paddingBottom: 120 }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #E8E0D8',
          backgroundColor: '#FAFAF8',
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
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0, flex: 1, textAlign: 'center' }}>
          Giỏ hàng ({getTotalItems()} món)
        </h1>
        <div style={{ width: 30 }} />
      </div>

      {/* Cart Items */}
      <div style={{ padding: '16px 16px 0' }}>
        {isAddingMore && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#FFF7ED',
              border: '1px solid #FDBA74',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: '#9A3412',
              lineHeight: 1.5,
            }}
          >
            📌 Đơn hàng <strong>{currentOrder.orderNumber}</strong> đang xử lý. Những món dưới đây sẽ được <strong>gọi thêm</strong> vào đơn hiện tại.
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div key={item.id} layout style={{ marginBottom: 10 }}>
              <CartItem item={item} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add more items link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoToMenu}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            border: '1.5px dashed #D4B896',
            borderRadius: 14,
            color: '#A0785D',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 6,
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          + Thêm món khác
        </motion.button>
      </div>

      {/* Bottom bar: Total + Order button */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E8E0D8',
          padding: '14px 20px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
      >
        {/* Coupon input (new orders only) */}
        {showCouponSection && (
          <div style={{ marginBottom: 12 }}>
            {appliedCoupon ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Check size={16} color="#16A34A" />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#166534' }}>
                      {appliedCoupon.promotion_name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#15803D' }}>
                      Mã: {appliedCoupon.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearCoupon}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    flexShrink: 0,
                  }}
                  aria-label="Xóa mã giảm giá"
                >
                  <X size={16} color="#6B6B6B" />
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag
                      size={16}
                      color="#A0785D"
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 36px',
                        border: couponError ? '1.5px solid #EF4444' : '1px solid #E8E0D8',
                        borderRadius: 12,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        backgroundColor: '#FAFAF8',
                        outline: 'none',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          validateAndApply(subtotal, storeInfo!.id);
                        }
                      }}
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => validateAndApply(subtotal, storeInfo!.id)}
                    disabled={isValidating || !couponCode.trim()}
                    style={{
                      padding: '0 16px',
                      borderRadius: 12,
                      border: '1.5px solid #D4B896',
                      backgroundColor: '#FFFFFF',
                      color: '#6F4E37',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isValidating || !couponCode.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: isValidating || !couponCode.trim() ? 0.6 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isValidating ? '...' : 'Áp dụng'}
                  </motion.button>
                </div>
                {couponError && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444' }}>{couponError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Summary */}
        {showCouponSection && appliedCoupon ? (
          <div style={{ marginBottom: 12 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#6B6B6B' }}>
                Tạm tính ({getTotalItems()} món)
              </span>
              <span style={{ fontSize: 14, color: '#6B6B6B' }}>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#16A34A' }}>
                Giảm giá ({appliedCoupon.code})
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>
                -{formatPrice(discountAmount)}
              </span>
            </div>
            <div
              style={{ borderTop: '1px dashed #E8E0D8', marginBottom: 8 }}
            />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                Tổng thanh toán
              </span>
              <motion.span
                key={finalAmount}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 20, fontWeight: 800, color: '#6F4E37' }}
              >
                {formatPrice(finalAmount)}
              </motion.span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: '#6B6B6B' }}>
              Tổng cộng ({getTotalItems()} món)
            </span>
            <motion.span
              key={subtotal}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={{ fontSize: 20, fontWeight: 800, color: '#6F4E37' }}
            >
              {formatPrice(subtotal)}
            </motion.span>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          style={{
            width: '100%',
            background: isSubmitting
              ? '#D4B896'
              : 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '15px 20px',
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 8px 24px rgba(111, 78, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang gửi đơn...
            </>
          ) : isAddingMore ? (
            'Gọi thêm món'
          ) : (
            'Đặt món'
          )}
        </motion.button>
      </div>
    </div>
  );
}
