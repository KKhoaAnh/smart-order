'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';

interface FloatingCartButtonProps {
  totalItems: number;
  totalAmount: number;
  onClick: () => void;
}

export function FloatingCartButton({ totalItems, totalAmount, onClick }: FloatingCartButtonProps) {
  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 50,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 16,
          padding: '14px 20px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(111, 78, 55, 0.35)',
          fontFamily: 'inherit',
        }}
      >
        {/* Left: Cart icon + count */}
        <div className="flex items-center gap-3">
          <div
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={18} color="#FFFFFF" />
            <motion.span
              key={totalItems}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {totalItems}
            </motion.span>
          </div>

          <span style={{ fontSize: 15, fontWeight: 600 }}>Giỏ hàng</span>
        </div>

        {/* Right: Total price */}
        <motion.span
          key={totalAmount}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {formatPrice(totalAmount)}
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
