'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, X, ImageOff, Package } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';
import { useCartStore, type ComboCartSubItem } from '../../../../store/cart-store';

interface CartItemProps {
  item: {
    id: string;
    productName: string;
    productImage?: string;
    variantName?: string;
    selectedOptions: { name: string; price: number }[];
    quantity: number;
    unitPrice: number;
    subtotal: number;
    note?: string;
    // Combo fields
    isCombo?: boolean;
    comboName?: string;
    comboSubItems?: ComboCartSubItem[];
  };
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        gap: 12,
        padding: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        border: item.isCombo ? '1.5px solid #F59E0B' : '1px solid #E8E0D8',
        position: 'relative',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 12,
          backgroundColor: item.isCombo ? '#FFF7ED' : '#F5F0EB',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : item.isCombo ? (
          <Package size={24} color="#F59E0B" strokeWidth={1.5} />
        ) : (
          <ImageOff size={22} color="#D4B896" strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.3 }}>
              {item.isCombo ? item.comboName || item.productName : item.productName}
            </h3>
            {item.isCombo && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#F59E0B',
                  backgroundColor: '#FFFBEB',
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: '1px solid #FDE68A',
                }}
              >
                COMBO
              </span>
            )}
          </div>

          {/* Regular item details: variant + options */}
          {!item.isCombo && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
              {item.variantName && (
                <span style={{ fontSize: 11, color: '#A0785D', backgroundColor: '#FAF5F0', padding: '1px 6px', borderRadius: 4 }}>
                  {item.variantName}
                </span>
              )}
              {item.selectedOptions.map((opt) => (
                <span
                  key={opt.name}
                  style={{ fontSize: 11, color: '#6B6B6B', backgroundColor: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}
                >
                  {opt.name}
                </span>
              ))}
            </div>
          )}

          {/* Combo sub-items */}
          {item.isCombo && item.comboSubItems && (
            <div style={{ marginTop: 4 }}>
              {item.comboSubItems.map((sub, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 2 }}>
                  <div style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#D4B896', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 11, color: '#4B5563' }}>
                      {sub.productName}
                    </span>
                    {(sub.variantName || sub.selectedOptions.length > 0) && (
                      <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }}>
                        {[
                          sub.variantName,
                          ...sub.selectedOptions.map((o) => o.name),
                        ].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {item.note && (
            <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', margin: '3px 0 0' }}>
              📝 {item.note}
            </p>
          )}
        </div>

        {/* Bottom: Price + Quantity */}
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#6F4E37' }}>
            {formatPrice(item.subtotal)}
          </span>

          {/* Quantity controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#F5F0EB',
              borderRadius: 10,
              padding: '3px 6px',
            }}
          >
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              <Minus size={12} color="#1A1A1A" />
            </button>

            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', minWidth: 16, textAlign: 'center' }}>
              {item.quantity}
            </span>

            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              <Plus size={12} color="#1A1A1A" />
            </button>
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeItem(item.id)}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#F5F0EB',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={12} color="#9CA3AF" />
      </button>
    </motion.div>
  );
}
