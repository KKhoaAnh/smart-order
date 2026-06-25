'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Tag, Copy, Check, Gift, Percent, ChevronRight, X, Clock, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '../../../../lib/format';

export interface ActivePromotion {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  min_order_amount: number;
  end_date: string;
  description?: string;
}

function formatPromotionValue(promo: ActivePromotion): string {
  if (promo.type === 'PERCENT') return `Giảm ${promo.value}%`;
  if (promo.type === 'FIXED') return `Giảm ${formatPrice(promo.value)}`;
  return `Tặng món miễn phí`;
}

function formatPromoEndDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getPromoIcon(type: string) {
  if (type === 'PERCENT') return <Percent size={14} />;
  if (type === 'FREE_ITEM') return <Gift size={14} />;
  return <Tag size={14} />;
}

function getPromoGradient(index: number): string {
  const gradients = [
    'linear-gradient(135deg, #6F4E37 0%, #A0785D 100%)',
    'linear-gradient(135deg, #7B5B3A 0%, #C4956A 100%)',
    'linear-gradient(135deg, #5D4037 0%, #A1887F 100%)',
    'linear-gradient(135deg, #8B5E3C 0%, #BFA07A 100%)',
  ];
  return gradients[index % gradients.length];
}

interface PromotionBannerProps {
  promotions: ActivePromotion[];
}

export function PromotionBanner({ promotions }: PromotionBannerProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<ActivePromotion | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCopy = useCallback(async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success(`Đã copy mã "${code}"`, {
        style: { fontSize: 13, borderRadius: 10 },
        iconTheme: { primary: '#6F4E37', secondary: '#FFFFFF' },
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Không thể copy mã');
    }
  }, []);

  // Scroll to a specific index
  const scrollToIndex = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = el.firstElementChild.clientWidth;
    const gap = 10;
    el.scrollTo({ left: idx * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  // Track active dot indicator on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.firstElementChild?.clientWidth || 1;
      const gap = 10;
      setActiveIdx(Math.round(scrollLeft / (cardWidth + gap)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [promotions.length]);

  // Auto-scroll every 4 seconds, pause when user is interacting
  useEffect(() => {
    if (promotions.length <= 1) return;

    const startAutoScroll = () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = setInterval(() => {
        if (isPaused) return;
        setActiveIdx((prev) => {
          const next = (prev + 1) % promotions.length;
          scrollToIndex(next);
          return next;
        });
      }, 4000);
    };

    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [promotions.length, isPaused, scrollToIndex]);

  // Pause handlers
  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => {
    // Resume after a short delay so the user can finish reading
    setTimeout(() => setIsPaused(false), 2000);
  };

  if (promotions.length === 0) return null;

  return (
    <>
      <div style={{ padding: '8px 16px 4px' }}>
        {/* Horizontal scrollable cards */}
        <div
          ref={scrollRef}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onMouseLeave={handleInteractionEnd}
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: 2,
          }}
        >
          {promotions.map((promo, index) => (
            <div
              key={promo.id}
              onClick={() => setSelectedPromo(promo)}
              style={{
                minWidth: '100%',
                flexShrink: 0,
                scrollSnapAlign: 'start',
                borderRadius: 14,
                background: getPromoGradient(index),
                color: '#FFFFFF',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 3px 12px rgba(111, 78, 55, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Background decorations */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -15,
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: 30,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />

              {/* Icon circle */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getPromoIcon(promo.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                {/* Top row: value + name */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                    {formatPromotionValue(promo)}
                  </span>
                </div>

                {/* Bottom row: code badge + min order + end date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {promo.code && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px dashed rgba(255,255,255,0.4)',
                      }}
                    >
                      {promo.code}
                    </span>
                  )}
                  {promo.min_order_amount > 0 && (
                    <span style={{ fontSize: 10, opacity: 0.75 }}>
                      Đơn từ {formatPrice(promo.min_order_amount)}
                    </span>
                  )}
                  <span style={{ fontSize: 10, opacity: 0.6 }}>
                    • đến {formatPromoEndDate(promo.end_date)}
                  </span>
                </div>

                {/* Tap hint */}
                <span style={{ fontSize: 10, opacity: 0.45, marginTop: 2, display: 'block' }}>
                  Nhấn để xem chi tiết →
                </span>
              </div>

              {/* Copy button */}
              {promo.code && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(promo.code, promo.id);
                  }}
                  aria-label={`Copy mã ${promo.code}`}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    background: copiedId === promo.id
                      ? 'rgba(74,222,128,0.3)'
                      : 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {copiedId === promo.id ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Dot indicators + auto-scroll progress */}
        {promotions.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 5,
              marginTop: 8,
            }}
          >
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  scrollToIndex(idx);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 3000);
                }}
                style={{
                  width: activeIdx === idx ? 16 : 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: activeIdx === idx ? '#6F4E37' : '#D4B896',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Promotion Detail Modal (bottom sheet) */}
      <AnimatePresence>
        {selectedPromo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPromo(null)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 50,
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
                borderRadius: '20px 20px 0 0',
                zIndex: 51,
                padding: '20px 20px',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              {/* Handle bar */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E8E0D8' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #6F4E37, #A0785D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getPromoIcon(selectedPromo.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                      {selectedPromo.name}
                    </h3>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#6F4E37' }}>
                      {formatPromotionValue(selectedPromo)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPromo(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#F3F0EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} color="#6B6B6B" />
                </button>
              </div>

              {/* Info rows */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {/* Code */}
                {selectedPromo.code && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#FAF5F0',
                      borderRadius: 12,
                      border: '1px dashed #D4B896',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginBottom: 2 }}>Mã khuyến mãi</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#6F4E37', letterSpacing: 1.5 }}>
                        {selectedPromo.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedPromo.code, selectedPromo.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#6F4E37',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {copiedId === selectedPromo.id ? (
                        <><Check size={13} /> Đã copy</>
                      ) : (
                        <><Copy size={13} /> Copy mã</>
                      )}
                    </button>
                  </div>
                )}

                {/* Conditions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedPromo.min_order_amount > 0 && (
                    <div
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: 10,
                        border: '1px solid #F3F0EB',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <ShoppingBag size={12} color="#9CA3AF" />
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>Đơn tối thiểu</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                        {formatPrice(selectedPromo.min_order_amount)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: 10,
                      border: '1px solid #F3F0EB',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                      <Clock size={12} color="#9CA3AF" />
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>Hạn sử dụng</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                      {formatPromoEndDate(selectedPromo.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedPromo.description && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', margin: '0 0 6px' }}>
                    Mô tả & điều kiện
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: '#4B5563',
                      margin: 0,
                      padding: '10px 14px',
                      backgroundColor: '#FAFAF8',
                      borderRadius: 10,
                      border: '1px solid #F3F0EB',
                    }}
                  >
                    {selectedPromo.description}
                  </p>
                </div>
              )}

              {/* Usage hint */}
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFF7ED',
                  borderRadius: 10,
                  border: '1px solid #FED7AA',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <Tag size={14} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 12, lineHeight: 1.5, color: '#92400E', margin: 0 }}>
                  Nhập mã ở trang giỏ hàng trước khi đặt đơn để được áp dụng khuyến mãi. Mỗi mã chỉ sử dụng được một lần.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
