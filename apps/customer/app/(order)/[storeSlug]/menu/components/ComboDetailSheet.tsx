'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { formatPrice } from '../../../../lib/format';
import { useCartStore, type CartItemInput, type ComboCartSubItem, type CartItemOption } from '../../../../store/cart-store';
import type { ComboData } from './ComboSection';
import toast from 'react-hot-toast';

interface ComboDetailSheetProps {
  combo: ComboData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SubItemSelection {
  productId: number;
  variantId?: number;
  selectedSugar?: number;
  selectedIce?: number;
  selectedToppings: Set<number>;
  expanded: boolean;
}

export function ComboDetailSheet({ combo, isOpen, onClose }: ComboDetailSheetProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [subItemSelections, setSubItemSelections] = useState<Map<number, SubItemSelection>>(new Map());

  // Init selections when combo changes
  useEffect(() => {
    if (combo) {
      const selections = new Map<number, SubItemSelection>();
      combo.items.forEach((item, idx) => {
        const sugarOpts = item.options?.filter((o: any) => o.option_type === 'sugar') || [];
        const iceOpts = item.options?.filter((o: any) => o.option_type === 'ice') || [];

        selections.set(item.id, {
          productId: item.product_id,
          variantId: item.default_variant_id
            || item.variants?.find((v: any) => v.is_default)?.id
            || item.variants?.[0]?.id,
          selectedSugar: sugarOpts[0]?.id,
          selectedIce: iceOpts[0]?.id,
          selectedToppings: new Set(),
          expanded: idx === 0, // first item expanded by default
        });
      });
      setSubItemSelections(selections);
      setQuantity(1);
    }
  }, [combo?.id]);

  if (!combo) return null;

  // Calculate total price = combo_price + variant upgrades + toppings
  const calculateTotalPrice = () => {
    let extra = 0;
    combo.items.forEach((item) => {
      const sel = subItemSelections.get(item.id);
      if (!sel) return;

      // Variant upgrade cost
      if (sel.variantId) {
        const variant = item.variants?.find((v: any) => v.id === sel.variantId);
        if (variant && variant.price_adjustment > 0) {
          extra += variant.price_adjustment * item.quantity;
        }
      }

      // Toppings cost
      const toppings = item.options?.filter((o: any) => o.option_type === 'topping' && sel.selectedToppings.has(o.id)) || [];
      extra += toppings.reduce((sum: number, t: any) => sum + t.price, 0) * item.quantity;
    });
    return (combo.combo_price + extra) * quantity;
  };

  const totalPrice = calculateTotalPrice();
  // const unitPrice = totalPrice / quantity;

  // Update a sub-item selection
  const updateSubItem = (itemId: number, updates: Partial<SubItemSelection>) => {
    setSubItemSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (current) {
        next.set(itemId, { ...current, ...updates });
      }
      return next;
    });
  };

  const toggleExpand = (itemId: number) => {
    const current = subItemSelections.get(itemId);
    if (current) {
      updateSubItem(itemId, { expanded: !current.expanded });
    }
  };

  const toggleTopping = (itemId: number, toppingId: number) => {
    const current = subItemSelections.get(itemId);
    if (current) {
      const newToppings = new Set(current.selectedToppings);
      if (newToppings.has(toppingId)) {
        newToppings.delete(toppingId);
      } else {
        newToppings.add(toppingId);
      }
      updateSubItem(itemId, { selectedToppings: newToppings });
    }
  };

  const handleAddToCart = () => {
    if (!combo) return;

    // Build sub-items for cart
    const comboSubItems: ComboCartSubItem[] = combo.items.map((item) => {
      const sel = subItemSelections.get(item.id);
      const variant = item.variants?.find((v: any) => v.id === sel?.variantId);
      const variantAdjustment = variant?.price_adjustment || 0;

      const selectedOpts: CartItemOption[] = [];
      // Sugar
      if (sel?.selectedSugar) {
        const sugar = item.options?.find((o: any) => o.id === sel.selectedSugar);
        if (sugar) selectedOpts.push({ id: sugar.id, name: sugar.option_name, price: sugar.price });
      }
      // Ice
      if (sel?.selectedIce) {
        const ice = item.options?.find((o: any) => o.id === sel.selectedIce);
        if (ice) selectedOpts.push({ id: ice.id, name: ice.option_name, price: ice.price });
      }
      // Toppings
      sel?.selectedToppings.forEach((tId) => {
        const topping = item.options?.find((o: any) => o.id === tId);
        if (topping) selectedOpts.push({ id: topping.id, name: topping.option_name, price: topping.price });
      });

      const toppingTotal = selectedOpts.filter((o) => {
        const orig = item.options?.find((op: any) => op.id === o.id);
        return orig?.option_type === 'topping';
      }).reduce((sum, o) => sum + o.price, 0);

      return {
        productId: item.product_id,
        productName: item.product_name,
        productImage: item.product_image,
        variantId: sel?.variantId,
        variantName: variant?.variant_name,
        variantAdjustment,
        selectedOptions: selectedOpts,
        optionsTotal: toppingTotal,
      };
    });

    const cartItem: CartItemInput = {
      productId: 0, // Not a regular product
      productName: combo.name,
      productImage: combo.image_url || combo.items[0]?.product_image,
      basePrice: combo.combo_price,
      variantAdjustment: 0,
      selectedOptions: [],
      quantity,
      isCombo: true,
      comboId: combo.id,
      comboName: combo.name,
      comboImage: combo.image_url || combo.items[0]?.product_image,
      comboBasePrice: combo.combo_price,
      comboSubItems: comboSubItems,
    };

    addItem(cartItem);
    toast.success(`Đã thêm ${combo.name} vào giỏ hàng`, {
      style: { fontSize: 14, borderRadius: 12 },
      iconTheme: { primary: '#6F4E37', secondary: '#FFFFFF' },
    });
    onClose();
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
              backgroundColor: 'rgba(0,0,0,0.5)',
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
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              zIndex: 51,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 16px 12px',
                borderBottom: '1px solid #F3F0EB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={16} color="#FFFFFF" />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                    {combo.name}
                  </h2>
                  {combo.save_percent > 0 && (
                    <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
                      Tiết kiệm {combo.save_percent}%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#F3F0EB',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#6B6B6B" />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {/* Price overview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  padding: '10px 14px',
                  backgroundColor: '#FFF7ED',
                  borderRadius: 12,
                  border: '1px solid #FED7AA',
                }}
              >
                <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>
                  {formatPrice(combo.original_price)}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#6F4E37' }}>
                  {formatPrice(combo.combo_price)}
                </span>
                {combo.description && (
                  <span style={{ fontSize: 12, color: '#6B6B6B', marginLeft: 'auto' }}>
                    {combo.description}
                  </span>
                )}
              </div>

              {/* Combo items list (each product is a collapsible section) */}
              {combo.items.map((item) => {
                const sel = subItemSelections.get(item.id);
                const isExpanded = sel?.expanded ?? false;
                const variants = item.variants || [];
                const sugarOpts = item.options?.filter((o: any) => o.option_type === 'sugar') || [];
                const iceOpts = item.options?.filter((o: any) => o.option_type === 'ice') || [];
                const toppingOpts = item.options?.filter((o: any) => o.option_type === 'topping') || [];
                const hasCustomization = variants.length > 0 || sugarOpts.length > 0 || iceOpts.length > 0 || toppingOpts.length > 0;

                const selectedVariant = variants.find((v: any) => v.id === sel?.variantId);

                return (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: 10,
                      borderRadius: 12,
                      border: '1px solid #E8E0D8',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Item header */}
                    <div
                      onClick={() => hasCustomization && toggleExpand(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        backgroundColor: isExpanded ? '#FAFAF8' : '#FFFFFF',
                        cursor: hasCustomization ? 'pointer' : 'default',
                      }}
                    >
                      {/* Product image */}
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                          {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.product_name}
                        </div>
                        {selectedVariant && (
                          <span style={{ fontSize: 11, color: '#6B6B6B' }}>
                            {selectedVariant.variant_name}
                            {selectedVariant.price_adjustment > 0 && ` (+${formatPrice(selectedVariant.price_adjustment)})`}
                          </span>
                        )}
                      </div>
                      {hasCustomization && (
                        isExpanded
                          ? <ChevronUp size={16} color="#9CA3AF" />
                          : <ChevronDown size={16} color="#9CA3AF" />
                      )}
                    </div>

                    {/* Expandable customization area */}
                    <AnimatePresence>
                      {isExpanded && hasCustomization && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #F3F0EB' }}>
                            {/* Variants (size) */}
                            {variants.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                                  Kích thước
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {variants.map((v: any) => {
                                    const isSelected = sel?.variantId === v.id;
                                    return (
                                      <button
                                        key={v.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateSubItem(item.id, { variantId: v.id });
                                        }}
                                        style={{
                                          padding: '5px 12px',
                                          borderRadius: 8,
                                          border: isSelected ? '1.5px solid #6F4E37' : '1px solid #E8E0D8',
                                          backgroundColor: isSelected ? '#FAF5F0' : '#FFFFFF',
                                          color: isSelected ? '#6F4E37' : '#6B6B6B',
                                          fontSize: 12,
                                          fontWeight: isSelected ? 600 : 400,
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                        }}
                                      >
                                        {v.variant_name}
                                        {v.price_adjustment > 0 && ` +${formatPrice(v.price_adjustment)}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Sugar options */}
                            {sugarOpts.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                                  Đường
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {sugarOpts.map((o: any) => {
                                    const isSelected = sel?.selectedSugar === o.id;
                                    return (
                                      <button
                                        key={o.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateSubItem(item.id, { selectedSugar: o.id });
                                        }}
                                        style={{
                                          padding: '5px 12px',
                                          borderRadius: 8,
                                          border: isSelected ? '1.5px solid #6F4E37' : '1px solid #E8E0D8',
                                          backgroundColor: isSelected ? '#FAF5F0' : '#FFFFFF',
                                          color: isSelected ? '#6F4E37' : '#6B6B6B',
                                          fontSize: 12,
                                          fontWeight: isSelected ? 600 : 400,
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                        }}
                                      >
                                        {o.option_name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Ice options */}
                            {iceOpts.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                                  Đá
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {iceOpts.map((o: any) => {
                                    const isSelected = sel?.selectedIce === o.id;
                                    return (
                                      <button
                                        key={o.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateSubItem(item.id, { selectedIce: o.id });
                                        }}
                                        style={{
                                          padding: '5px 12px',
                                          borderRadius: 8,
                                          border: isSelected ? '1.5px solid #6F4E37' : '1px solid #E8E0D8',
                                          backgroundColor: isSelected ? '#FAF5F0' : '#FFFFFF',
                                          color: isSelected ? '#6F4E37' : '#6B6B6B',
                                          fontSize: 12,
                                          fontWeight: isSelected ? 600 : 400,
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                        }}
                                      >
                                        {o.option_name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Toppings */}
                            {toppingOpts.length > 0 && (
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                                  Topping
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {toppingOpts.map((o: any) => {
                                    const isSelected = sel?.selectedToppings.has(o.id);
                                    return (
                                      <button
                                        key={o.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTopping(item.id, o.id);
                                        }}
                                        style={{
                                          padding: '5px 12px',
                                          borderRadius: 8,
                                          border: isSelected ? '1.5px solid #6F4E37' : '1px solid #E8E0D8',
                                          backgroundColor: isSelected ? '#FAF5F0' : '#FFFFFF',
                                          color: isSelected ? '#6F4E37' : '#6B6B6B',
                                          fontSize: 12,
                                          fontWeight: isSelected ? 600 : 400,
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                        }}
                                      >
                                        {o.option_name}
                                        {o.price > 0 && ` +${formatPrice(o.price)}`}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Bottom bar: quantity + add to cart */}
            <div
              style={{
                padding: '12px 16px',
                paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                borderTop: '1px solid #E8E0D8',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Quantity selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#F3F0EB',
                  borderRadius: 12,
                  padding: '6px 10px',
                }}
              >
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    opacity: quantity <= 1 ? 0.3 : 1,
                  }}
                >
                  <Minus size={16} color="#6F4E37" />
                </button>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', minWidth: 20, textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                  }}
                >
                  <Plus size={16} color="#6F4E37" />
                </button>
              </div>

              {/* Add to cart */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#6F4E37',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                Thêm vào giỏ — {formatPrice(totalPrice)}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
