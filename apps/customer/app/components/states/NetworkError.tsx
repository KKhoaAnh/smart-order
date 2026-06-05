'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
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
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <WifiOff size={40} color="#EF4444" strokeWidth={1.5} />
      </motion.div>

      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        Không có kết nối
      </h3>

      <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 32, maxWidth: 300, lineHeight: 1.6 }}>
        {message || 'Vui lòng kiểm tra kết nối mạng của bạn và thử lại.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#6F4E37',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#5C3D2E';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#6F4E37';
          }}
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
    </motion.div>
  );
}
