'use client';

import { motion } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';

export interface ComboData {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  combo_price: number;
  original_price: number;
  save_percent: number;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    default_variant_id?: number;
    quantity: number;
    base_price: number;
    variants: any[];
    options: any[];
  }[];
}

interface ComboSectionProps {
  combos: ComboData[];
  onComboClick: (combo: ComboData) => void;
}

export function ComboSection({ combos, onComboClick }: ComboSectionProps) {
  if (combos.length === 0) return null;

  return (
    <div style={{ padding: '12px 16px 4px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Package size={14} color="#FFFFFF" />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Combo ưu đãi
        </h2>
      </div>

      {/* Horizontal scrollable combo cards */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {combos.map((combo, index) => (
          <motion.div
            key={combo.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onComboClick(combo)}
            style={{
              minWidth: 220,
              maxWidth: 240,
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E8E0D8',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(111,78,55,0.06)',
            }}
          >
            {/* Combo image or gradient header */}
            <div
              style={{
                height: 90,
                background: combo.image_url
                  ? `url(${combo.image_url}) center/cover`
                  : 'linear-gradient(135deg, #6F4E37 0%, #A67C52 50%, #D4B896 100%)',
                position: 'relative',
              }}
            >
              {/* Save badge */}
              {combo.save_percent > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 10,
                  }}
                >
                  Tiết kiệm {combo.save_percent}%
                </div>
              )}

              {/* Combo name overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '20px 12px 8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: 1.2,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {combo.name}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '10px 12px 12px' }}>
              {/* Product list mini */}
              <div style={{ marginBottom: 8 }}>
                {combo.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#A67C52',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.3 }}>
                      {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.product_name}
                    </span>
                  </div>
                ))}
                {combo.items.length > 3 && (
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    +{combo.items.length - 3} món khác
                  </span>
                )}
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#9CA3AF',
                      textDecoration: 'line-through',
                      marginRight: 6,
                    }}
                  >
                    {formatPrice(combo.original_price)}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#6F4E37',
                    }}
                  >
                    {formatPrice(combo.combo_price)}
                  </span>
                </div>

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#6F4E37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={14} color="#FFFFFF" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
