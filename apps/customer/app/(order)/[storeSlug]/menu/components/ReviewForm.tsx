'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomerAuthStore } from '../../../../store/customer-auth-store';
import { AuthBottomSheet } from '../../../../components/auth/AuthBottomSheet';
import { createReview } from '../../../../lib/customer-api';

interface ReviewFormProps {
  productId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { isAuthenticated, customer, clearAuth } = useCustomerAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleSwitchAccount = () => {
    clearAuth();
    setShowAuth(true);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    try {
      await createReview({ product_id: productId, rating, comment: comment.trim() || undefined });
      toast.success('Đã gửi đánh giá');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Gửi đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ padding: '16px 0 0' }}>
        {isAuthenticated && customer && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: 12, backgroundColor: '#F5F0EB',
            marginBottom: 14, gap: 8,
          }}>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Đánh giá với tài khoản</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '2px 0 0' }}>
                {customer.name} · {customer.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwitchAccount}
              style={{
                fontSize: 12, fontWeight: 600, color: '#6F4E37',
                background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Đổi tài khoản
            </button>
          </div>
        )}
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>Chọn số sao</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              <Star
                size={32}
                fill={n <= rating ? '#F59E0B' : 'transparent'}
                color={n <= rating ? '#F59E0B' : '#D1D5DB'}
              />
            </motion.button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={3}
          style={{
            width: '100%', borderRadius: 12, border: '1.5px solid #E8E0D8',
            padding: '10px 14px', fontSize: 14, resize: 'none', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box', marginBottom: 12,
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #E8E0D8',
              background: '#fff', fontSize: 14, cursor: 'pointer', color: '#6B6B6B',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #6F4E37, #5C3D2E)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
      <AuthBottomSheet
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    </>
  );
}
