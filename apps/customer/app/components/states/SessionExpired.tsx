'use client';

import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';

export function SessionExpired() {
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
          backgroundColor: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <QrCode size={40} color="#F59E0B" strokeWidth={1.5} />
      </motion.div>

      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        Phiên đã hết hạn
      </h3>

      <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 8, maxWidth: 300, lineHeight: 1.6 }}>
        Phiên đặt món của bạn đã hết hạn hoặc đã được đóng.
      </p>

      <p style={{ fontSize: 14, color: '#A0785D', fontWeight: 500, maxWidth: 300 }}>
        Vui lòng quét lại mã QR tại bàn để tiếp tục đặt món.
      </p>
    </motion.div>
  );
}
