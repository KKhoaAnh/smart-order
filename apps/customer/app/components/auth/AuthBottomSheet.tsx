'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, ArrowRight, Loader2 } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/customer-auth-store';
import { registerCustomer, loginCustomer } from '../../lib/customer-api';

interface AuthBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthBottomSheet({ isOpen, onClose, onSuccess }: AuthBottomSheetProps) {
  const { setAuth } = useCustomerAuthStore();
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async () => {
    if (phone.length < 9) {
      setError('Số điện thoại không hợp lệ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Try login first
      const result = await loginCustomer(phone);
      setAuth(result.customer, result.access_token);
      onSuccess?.();
      onClose();
      resetForm();
    } catch {
      // Not found → need to register with name
      setStep('name');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (name.trim().length < 1) {
      setError('Vui lòng nhập tên');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await registerCustomer(phone, name.trim());
      setAuth(result.customer, result.access_token);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setName('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { onClose(); resetForm(); }}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 100, backdropFilter: 'blur(4px)',
            }}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
              backgroundColor: '#FAFAF8', borderRadius: '24px 24px 0 0',
              padding: '24px 20px 40px', maxHeight: '70vh',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D4B896' }} />
            </div>

            {/* Close */}
            <button
              onClick={() => { onClose(); resetForm(); }}
              style={{
                position: 'absolute', top: 16, right: 16, padding: 8,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <X size={20} color="#6B6B6B" />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 28, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #D4B896, #A67C52)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step === 'phone'
                  ? <Phone size={24} color="#fff" />
                  : <User size={24} color="#fff" />
                }
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                {step === 'phone' ? 'Đăng nhập' : 'Chào bạn mới!'}
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6 }}>
                {step === 'phone'
                  ? 'Nhập số điện thoại để đánh giá món ăn'
                  : 'Cho mình biết tên bạn nhé'
                }
              </p>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {step === 'phone' ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', borderRadius: 14,
                  border: '1.5px solid #E8E0D8', backgroundColor: '#fff',
                }}>
                  <Phone size={18} color="#A67C52" />
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    autoFocus
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: 16,
                      fontWeight: 500, color: '#1A1A1A', backgroundColor: 'transparent',
                    }}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 14,
                    border: '1.5px solid #E8E0D8', backgroundColor: '#fff',
                  }}
                >
                  <User size={18} color="#A67C52" />
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: 16,
                      fontWeight: 500, color: '#1A1A1A', backgroundColor: 'transparent',
                    }}
                  />
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 13, color: '#DC2626', margin: 0, paddingLeft: 4 }}
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <button
                onClick={step === 'phone' ? handlePhoneSubmit : handleRegister}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: '#fff',
                  background: loading
                    ? '#C4A882'
                    : 'linear-gradient(135deg, #A67C52, #8B5E34)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    {step === 'phone' ? 'Tiếp tục' : 'Bắt đầu'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {step === 'name' && (
                <button
                  onClick={() => { setStep('phone'); setError(''); }}
                  style={{
                    padding: '10px', borderRadius: 14, border: '1px solid #E8E0D8',
                    backgroundColor: 'transparent', cursor: 'pointer',
                    fontSize: 14, color: '#6B6B6B',
                  }}
                >
                  ← Quay lại
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
