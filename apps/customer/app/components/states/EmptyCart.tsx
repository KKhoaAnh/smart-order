'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface EmptyCartProps {
  onBrowseMenu: () => void;
}

export function EmptyCart({ onBrowseMenu }: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          backgroundColor: '#F5F0EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <ShoppingBag size={40} color="#A0785D" strokeWidth={1.5} />
      </motion.div>

      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1A1A1A',
          marginBottom: 8,
        }}
      >
        Giỏ hàng trống
      </h3>

      <p
        style={{
          fontSize: 14,
          color: '#6B6B6B',
          marginBottom: 32,
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        Bạn chưa thêm món nào. Hãy khám phá menu và chọn những món yêu thích nhé!
      </p>

      <button
        onClick={onBrowseMenu}
        style={{
          backgroundColor: '#6F4E37',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#5C3D2E';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#6F4E37';
        }}
      >
        Xem Menu
      </button>
    </motion.div>
  );
}
