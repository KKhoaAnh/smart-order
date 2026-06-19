'use client';

import { useState, useCallback } from 'react';
import { useCustomerAuthStore } from '../store/customer-auth-store';
import { validateCoupon } from '../lib/api';
import toast from 'react-hot-toast';

interface AppliedCoupon {
  code: string;
  promotion_name: string;
  discount_type: string;
  discount_amount: number;
}

interface UseCouponReturn {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: AppliedCoupon | null;
  isValidating: boolean;
  error: string | null;
  validateAndApply: (orderAmount: number, storeId: number) => Promise<void>;
  clearCoupon: () => void;
}

export function useCoupon(): UseCouponReturn {
  const { customer, isAuthenticated } = useCustomerAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndApply = useCallback(
    async (orderAmount: number, storeId: number) => {
      if (!couponCode.trim()) {
        setError('Vui lòng nhập mã giảm giá');
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        const result = await validateCoupon(
          couponCode.trim().toUpperCase(),
          storeId,
          orderAmount,
          isAuthenticated && customer ? customer.id : undefined,
        );

        if (result.valid) {
          setAppliedCoupon({
            code: couponCode.trim().toUpperCase(),
            promotion_name: result.promotion_name,
            discount_type: result.discount_type,
            discount_amount: result.discount_amount,
          });
          setError(null);
          toast.success(`Áp dụng mã thành công! Giảm ${new Intl.NumberFormat('vi-VN').format(result.discount_amount)}đ`);
        } else {
          setError(result.message || 'Mã giảm giá không hợp lệ');
          setAppliedCoupon(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể kiểm tra mã giảm giá';
        setError(message);
        setAppliedCoupon(null);
      } finally {
        setIsValidating(false);
      }
    },
    [couponCode, customer, isAuthenticated],
  );

  const clearCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
    setError(null);
  }, []);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isValidating,
    error,
    validateAndApply,
    clearCoupon,
  };
}
