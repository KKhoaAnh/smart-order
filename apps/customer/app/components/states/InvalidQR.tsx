'use client';

import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';

interface InvalidQRProps {
  message?: string;
}

export function InvalidQR({ message }: InvalidQRProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <ScanLine size={40} color="#EF4444" strokeWidth={1.5} />
      </motion.div>

      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        Mã QR không hợp lệ
      </h3>

      <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 8, maxWidth: 300, lineHeight: 1.6 }}>
        {message || 'Mã QR bạn quét không tồn tại hoặc đã hết hiệu lực.'}
      </p>

      <p style={{ fontSize: 14, color: '#A0785D', fontWeight: 500, maxWidth: 300 }}>
        Vui lòng thử quét lại mã QR khác tại bàn của bạn.
      </p>
    </motion.div>
  );
}
