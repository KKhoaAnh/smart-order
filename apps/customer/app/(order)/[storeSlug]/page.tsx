'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coffee, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../store/session-store';
import { initSession } from '../../lib/api';
import { InvalidQR } from '../../components/states/InvalidQR';

export default function LandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;
  const qrToken = searchParams.get('table');

  const {
    setSession,
    setStoreSlug,
    storeInfo,
    tableInfo,
    isInitialized,
    isLoading,
    setLoading,
    error,
    setError,
  } = useSessionStore();

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!qrToken) {
      setError('Không tìm thấy mã QR. Vui lòng quét lại.');
      return;
    }

    if (isInitialized && storeInfo && tableInfo) {
      setShowContent(true);
      return;
    }

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await initSession(qrToken);
        setSession(result);
        setStoreSlug(storeSlug);
        setTimeout(() => setShowContent(true), 300);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Mã QR không hợp lệ';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken]);

  // Error state
  if (error && !isLoading) {
    return <InvalidQR message={error} />;
  }

  // Loading state
  if (isLoading || !showContent) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '3px solid #E8E0D8',
              borderTopColor: '#6F4E37',
            }}
          />
          <p style={{ color: '#6B6B6B', fontSize: 14 }}>Đang kết nối...</p>
        </motion.div>
      </div>
    );
  }

  const handleViewMenu = () => {
    router.push(`/${storeSlug}/menu`);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      {/* Logo & Welcome Animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 360 }}
      >
        {/* Coffee Icon / Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #6F4E37 0%, #A0785D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 12px 32px rgba(111, 78, 55, 0.25)',
          }}
        >
          <Coffee size={44} color="#FFFFFF" strokeWidth={1.5} />
        </motion.div>

        {/* Store Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          {storeInfo?.name || 'Smart Order'}
        </motion.h1>

        {/* Store Address */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center gap-1.5"
          style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 24 }}
        >
          <MapPin size={14} />
          <span>{storeInfo?.address}</span>
        </motion.div>

        {/* Table Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: '20px 28px',
            marginBottom: 40,
            width: '100%',
            boxShadow: '0 4px 16px rgba(111, 78, 55, 0.08)',
            border: '1px solid #E8E0D8',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bàn của bạn
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#6F4E37' }}>
                {tableInfo?.table_number}
              </p>
            </div>
            {tableInfo?.area && (
              <div
                style={{
                  backgroundColor: '#F5F0EB',
                  borderRadius: 10,
                  padding: '6px 14px',
                }}
              >
                <span style={{ fontSize: 13, color: '#A0785D', fontWeight: 500 }}>
                  {tableInfo.area}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleViewMenu}
          style={{
            width: '100%',
            maxWidth: 320,
            background: 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 16,
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(111, 78, 55, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          Xem Menu & Đặt Món
          <ArrowRight size={18} />
        </motion.button>

        {/* Opening Hours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center gap-1.5"
          style={{ marginTop: 20, color: '#9CA3AF', fontSize: 12 }}
        >
          <Clock size={12} />
          <span>Phục vụ tại bàn • Thanh toán tại quầy</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
