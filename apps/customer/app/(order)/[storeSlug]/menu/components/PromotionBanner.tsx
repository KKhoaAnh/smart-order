'use client';

import { useState, useCallback } from 'react';
import { Tag, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
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
  return `Tặng món trị giá ${formatPrice(promo.value)}`;
}

function formatPromoEndDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getCollapsedLabel(promotions: ActivePromotion[]): string {
  if (promotions.length === 1) {
    const p = promotions[0];
    return p.code || p.name;
  }
  const codes = promotions.filter((p) => p.code).map((p) => p.code);
  if (codes.length > 0) {
    return codes.slice(0, 2).join(' • ') + (codes.length > 2 ? ` +${codes.length - 2}` : '');
  }
  return `${promotions.length} khuyến mãi`;
}

interface PromotionBannerProps {
  promotions: ActivePromotion[];
}

export function PromotionBanner({ promotions }: PromotionBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = useCallback(async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success('Đã copy mã giảm giá');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Không thể copy mã');
    }
  }, []);

  if (promotions.length === 0) return null;

  return (
    <div
      style={{
        padding: '0 16px 10px',
        backgroundColor: '#FAFAF8',
      }}
    >
      {/* Collapsed bar — chiều cao cố định, không gây layout shift */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Thu gọn khuyến mãi' : 'Xem chi tiết khuyến mãi'}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          background: 'linear-gradient(135deg, #6F4E37 0%, #A0785D 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(111, 78, 55, 0.2)',
          minHeight: 44,
        }}
      >
        <Tag size={16} style={{ flexShrink: 0, opacity: 0.9 }} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 600,
              opacity: 0.85,
              letterSpacing: 0.6,
              lineHeight: 1.2,
            }}
          >
            KHUYẾN MÃI
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
          >
            {getCollapsedLabel(promotions)}
          </p>
        </div>
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded panel — CSS transition, không dùng framer-motion */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              paddingTop: 10,
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-x',
              scrollbarWidth: 'none',
            }}
          >
            {promotions.map((promo) => (
              <div
                key={promo.id}
                style={{
                  minWidth: 260,
                  maxWidth: 280,
                  flexShrink: 0,
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6F4E37 0%, #A0785D 50%, #D4B896 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 6px 20px rgba(111, 78, 55, 0.25)',
                }}
              >
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
                  {promo.name}
                </p>
                <p style={{ margin: '6px 0 10px', fontSize: 12, opacity: 0.9, lineHeight: 1.4 }}>
                  {formatPromotionValue(promo)}
                  {promo.min_order_amount > 0 &&
                    ` • Đơn từ ${formatPrice(promo.min_order_amount)}`}
                </p>
                {promo.description && (
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: 11,
                      opacity: 0.8,
                      lineHeight: 1.4,
                    }}
                  >
                    {promo.description}
                  </p>
                )}
                {promo.code ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      {promo.code}
                    </div>
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
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        color: '#FFFFFF',
                      }}
                    >
                      {copiedId === promo.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>{promo.name}</p>
                )}
                <p style={{ margin: '10px 0 0', fontSize: 11, opacity: 0.75 }}>
                  HSD: {formatPromoEndDate(promo.end_date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
