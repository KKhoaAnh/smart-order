'use client';

import { motion } from 'framer-motion';
import { Flame, ImageOff, Star, Heart } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';
import type { MenuProductDto } from 'shared-types';

interface ProductCardProps {
  product: MenuProductDto;
  onClick: () => void;
  cartQuantity?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function ProductCard({ product, onClick, cartQuantity, isFavorite, onToggleFavorite }: ProductCardProps) {
  const isUnavailable = !product.is_available;

  // Get the starting price (base + default variant adjustment)
  const defaultVariant = product.variants?.find((v) => v.is_default);
  const displayPrice = product.base_price + (defaultVariant?.price_adjustment || 0);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={isUnavailable ? undefined : onClick}
      style={{
        display: 'flex',
        gap: 14,
        padding: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid #E8E0D8',
        boxShadow: '0 2px 8px rgba(111, 78, 55, 0.05)',
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        opacity: isUnavailable ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 14,
          backgroundColor: '#F5F0EB',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isUnavailable ? 'grayscale(100%)' : 'none',
            }}
          />
        ) : (
          <ImageOff size={28} color="#D4B896" strokeWidth={1.5} />
        )}

        {/* Sold out overlay */}
        {isUnavailable && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="flex items-center gap-1.5" style={{ marginBottom: 3 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#1A1A1A',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {product.name}
            </h3>

            {product.is_popular && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              >
                <Flame size={10} />
                Hot
              </span>
            )}
          </div>

          {product.description && (
            <p
              style={{
                fontSize: 12,
                color: '#9CA3AF',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Rating */}
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#6F4E37' }}>
            {formatPrice(displayPrice)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(product.review_count ?? 0) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9CA3AF' }}>
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                {Number(product.avg_rating).toFixed(1)} ({product.review_count})
              </span>
            )}
            {product.variants && product.variants.length > 1 && (
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                {product.variants.length} size
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cart Quantity Badge */}
      {cartQuantity && cartQuantity > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: 8,
            right: onToggleFavorite ? 34 : 8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: '#6F4E37',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cartQuantity}
        </motion.div>
      )}

      {/* Favorite Heart Button */}
      {onToggleFavorite && (
        <motion.div
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: isFavorite ? '#FEF2F2' : 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Heart
            size={14}
            color={isFavorite ? '#EF4444' : '#9CA3AF'}
            fill={isFavorite ? '#EF4444' : 'none'}
          />
        </motion.div>
      )}
    </motion.button>
  );
}
