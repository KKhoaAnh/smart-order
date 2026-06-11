'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageOff, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';
import { useCartStore, type CartItemInput } from '../../../../store/cart-store';
import type { MenuProductDto } from 'shared-types';
import toast from 'react-hot-toast';
import { ReviewSection } from './ReviewSection';

interface ProductDetailSheetProps {
  product: MenuProductDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailSheet({ product, isOpen, onClose }: ProductDetailSheetProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<Map<number, boolean>>(new Map());
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedSugar, setSelectedSugar] = useState<number | undefined>();
  const [selectedIce, setSelectedIce] = useState<number | undefined>();

  // Derive options from product (safe even when product is null)
  const sugarOptions = useMemo(() => product?.options?.filter((o) => o.option_type === 'sugar') || [], [product]);
  const iceOptions = useMemo(() => product?.options?.filter((o) => o.option_type === 'ice') || [], [product]);
  const toppingOptions = useMemo(() => product?.options?.filter((o) => o.option_type === 'topping') || [], [product]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const defaultVariant = product.variants?.find((v) => v.is_default);
      setSelectedVariantId(defaultVariant?.id || product.variants?.[0]?.id);
      setSelectedOptions(new Map());
      setQuantity(1);
      setNote('');
      setSelectedSugar(sugarOptions[0]?.id);
      setSelectedIce(iceOptions[0]?.id);
    }
  }, [product?.id, sugarOptions, iceOptions]);

  if (!product) return null;

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const variantAdjustment = selectedVariant?.price_adjustment || 0;

  // Calculate total
  const selectedToppings = toppingOptions.filter((o) => selectedOptions.get(o.id));
  const toppingsPrice = selectedToppings.reduce((sum, o) => sum + o.price, 0);
  const unitPrice = product.base_price + variantAdjustment + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  // Build selected options list for cart
  const buildSelectedOptions = () => {
    const opts: { id: number; name: string; price: number }[] = [];

    if (selectedSugar) {
      const sugar = sugarOptions.find((o) => o.id === selectedSugar);
      if (sugar) opts.push({ id: sugar.id, name: sugar.option_name, price: sugar.price });
    }
    if (selectedIce) {
      const ice = iceOptions.find((o) => o.id === selectedIce);
      if (ice) opts.push({ id: ice.id, name: ice.option_name, price: ice.price });
    }
    selectedToppings.forEach((t) => {
      opts.push({ id: t.id, name: t.option_name, price: t.price });
    });

    return opts;
  };

  const handleAddToCart = () => {
    const cartItem: CartItemInput = {
      productId: product.id,
      productName: product.name,
      productImage: product.image_url || undefined,
      variantId: selectedVariantId,
      variantName: selectedVariant?.variant_name,
      basePrice: product.base_price,
      variantAdjustment,
      selectedOptions: buildSelectedOptions(),
      quantity,
      note: note.trim() || undefined,
    };

    addItem(cartItem);
    toast.success(`Đã thêm ${product.name}`, { icon: '✅', duration: 2000 });
    onClose();
  };

  const toggleTopping = (id: number) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      next.set(id, !next.get(id));
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90vh',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 8,
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#D1D5DB',
                }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F5F0EB',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <X size={16} color="#6B6B6B" />
            </button>

            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 100 }}>
              {/* Product Image */}
              <div
                style={{
                  width: '100%',
                  height: 200,
                  backgroundColor: '#F5F0EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageOff size={48} color="#D4B896" strokeWidth={1} />
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px 20px 0' }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0, marginBottom: 6 }}>
                  {product.name}
                </h2>
                {product.description && (
                  <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: 0, marginBottom: 4 }}>
                    {product.description}
                  </p>
                )}
                <p style={{ fontSize: 20, fontWeight: 700, color: '#6F4E37', margin: 0 }}>
                  {formatPrice(product.base_price)}
                </p>
              </div>

              {/* Variants (Size) */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                  <SectionTitle>Chọn size</SectionTitle>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {product.variants.map((v) => (
                      <OptionChip
                        key={v.id}
                        label={v.variant_name}
                        sublabel={v.price_adjustment > 0 ? `+${formatPrice(v.price_adjustment)}` : undefined}
                        isActive={selectedVariantId === v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Level */}
              {sugarOptions.length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                  <SectionTitle>Mức đường</SectionTitle>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {sugarOptions.map((o) => (
                      <OptionChip
                        key={o.id}
                        label={o.option_name}
                        isActive={selectedSugar === o.id}
                        onClick={() => setSelectedSugar(o.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Level */}
              {iceOptions.length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                  <SectionTitle>Mức đá</SectionTitle>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {iceOptions.map((o) => (
                      <OptionChip
                        key={o.id}
                        label={o.option_name}
                        isActive={selectedIce === o.id}
                        onClick={() => setSelectedIce(o.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {toppingOptions.length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                  <SectionTitle>Topping</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {toppingOptions.map((o) => (
                      <ToppingRow
                        key={o.id}
                        label={o.option_name}
                        price={o.price}
                        isSelected={!!selectedOptions.get(o.id)}
                        onToggle={() => toggleTopping(o.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <ReviewSection productId={product.id} />

              {/* Note */}
              <div style={{ padding: '20px 20px 0' }}>
                <SectionTitle>Ghi chú</SectionTitle>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ít đá, nhiều sữa..."
                  rows={2}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: '1.5px solid #E8E0D8',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#1A1A1A',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#FAFAF8',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#A0785D')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E0D8')}
                />
              </div>
            </div>

            {/* Bottom bar: Quantity + Add to Cart */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E8E0D8',
                padding: '14px 20px',
                paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Quantity */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: '#F5F0EB',
                  borderRadius: 12,
                  padding: '6px 10px',
                }}
              >
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: quantity <= 1 ? 'transparent' : '#FFFFFF',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: quantity > 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Minus size={14} color={quantity <= 1 ? '#9CA3AF' : '#1A1A1A'} />
                </button>

                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', minWidth: 20, textAlign: 'center' }}>
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <Plus size={14} color="#1A1A1A" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 16px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(111, 78, 55, 0.25)',
                }}
              >
                Thêm — {formatPrice(totalPrice)}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------- Sub-components ----------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, marginBottom: 10 }}>
      {children}
    </h4>
  );
}

function OptionChip({
  label,
  sublabel,
  isActive,
  onClick,
}: {
  label: string;
  sublabel?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 24,
        border: `1.5px solid ${isActive ? '#6F4E37' : '#E8E0D8'}`,
        backgroundColor: isActive ? '#6F4E37' : '#FFFFFF',
        color: isActive ? '#FFFFFF' : '#1A1A1A',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'inherit',
      }}
    >
      {label}
      {sublabel && (
        <span style={{ fontSize: 11, opacity: 0.8 }}>{sublabel}</span>
      )}
    </motion.button>
  );
}

function ToppingRow({
  label,
  price,
  isSelected,
  onToggle,
}: {
  label: string;
  price: number;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 12,
        border: `1.5px solid ${isSelected ? '#6F4E37' : '#E8E0D8'}`,
        backgroundColor: isSelected ? '#FAF5F0' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            border: `2px solid ${isSelected ? '#6F4E37' : '#D1D5DB'}`,
            backgroundColor: isSelected ? '#6F4E37' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{label}</span>
      </div>

      <span style={{ fontSize: 13, color: '#6F4E37', fontWeight: 600 }}>
        +{formatPrice(price)}
      </span>
    </button>
  );
}
