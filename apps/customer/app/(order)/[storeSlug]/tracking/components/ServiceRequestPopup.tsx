'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Receipt, MessageSquare, X, Loader2 } from 'lucide-react';
import { useServiceRequest } from '../../../../hooks/useServiceRequest';

interface ServiceRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUEST_OPTIONS = [
  {
    type: 'CALL_STAFF',
    icon: Bell,
    label: 'Gọi nhân viên',
    sublabel: 'Nhân viên sẽ đến bàn của bạn',
    color: '#6F4E37',
    bg: '#FAF5F0',
  },
  {
    type: 'REQUEST_BILL',
    icon: Receipt,
    label: 'Yêu cầu tính tiền',
    sublabel: 'Nhân viên sẽ mang hóa đơn đến',
    color: '#22C55E',
    bg: '#F0FDF4',
  },
  {
    type: 'OTHER',
    icon: MessageSquare,
    label: 'Yêu cầu khác',
    sublabel: 'Gửi tin nhắn cho nhân viên',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
];

export function ServiceRequestPopup({ isOpen, onClose }: ServiceRequestPopupProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { sendCallStaff, sendRequestBill, sendOtherRequest, isLoading } = useServiceRequest();

  const handleSend = async () => {
    let success = false;

    switch (selectedType) {
      case 'CALL_STAFF':
        success = await sendCallStaff(message || undefined);
        break;
      case 'REQUEST_BILL':
        success = await sendRequestBill(message || undefined);
        break;
      case 'OTHER':
        success = await sendOtherRequest(message);
        break;
    }

    if (success) {
      setSelectedType(null);
      setMessage('');
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedType(null);
      setMessage('');
      onClose();
    }
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
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              zIndex: 101,
              padding: '0 20px 20px',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Drag Handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#D1D5DB',
                }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F5F0EB',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color="#6B6B6B" />
            </button>

            {/* Title */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
                marginBottom: 16,
              }}
            >
              Bạn cần hỗ trợ gì?
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {REQUEST_OPTIONS.map((option) => {
                const IconComp = option.icon;
                const isSelected = selectedType === option.type;

                return (
                  <motion.button
                    key={option.type}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(option.type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: `2px solid ${isSelected ? option.color : '#E8E0D8'}`,
                      backgroundColor: isSelected ? option.bg : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: isSelected ? option.color : option.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconComp
                        size={20}
                        color={isSelected ? '#FFFFFF' : option.color}
                      />
                    </div>

                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                        {option.label}
                      </p>
                      <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0, marginTop: 2 }}>
                        {option.sublabel}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Message input (shown for OTHER or when selected) */}
            <AnimatePresence>
              {selectedType && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', marginBottom: 16 }}
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      selectedType === 'OTHER'
                        ? 'Nhập yêu cầu của bạn...'
                        : 'Ghi chú thêm (không bắt buộc)...'
                    }
                    rows={2}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1.5px solid #E8E0D8',
                      padding: '10px 14px',
                      fontSize: 14,
                      color: '#1A1A1A',
                      resize: 'none',
                      fontFamily: 'inherit',
                      outline: 'none',
                      backgroundColor: '#FAFAF8',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#A0785D')}
                    onBlur={(e) => (e.target.style.borderColor = '#E8E0D8')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={!selectedType || isLoading || (selectedType === 'OTHER' && !message.trim())}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor:
                  !selectedType || isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                backgroundColor:
                  !selectedType || isLoading ? '#D4B896' : '#6F4E37',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
