'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Store } from 'lucide-react';
import { useSessionStore } from '../../../store/session-store';
import { useCartStore } from '../../../store/cart-store';
import { useMenu } from '../../../hooks/useMenu';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { FloatingCartButton } from './components/FloatingCartButton';
import { Skeleton } from '../../../components/ui/Skeleton';
import { SessionExpired } from '../../../components/states/SessionExpired';
import { NetworkError } from '../../../components/states/NetworkError';
import type { MenuProductDto } from 'shared-types';

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;

  const { storeInfo, tableInfo, isInitialized } = useSessionStore();
  const cartItems = useCartStore((s) => s.items);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalAmount = useCartStore((s) => s.getTotalAmount);

  const {
    filteredCategories,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isLoading,
    error,
    refetch,
    categories,
  } = useMenu({ storeId: storeInfo?.id || null, enabled: isInitialized });

  const [selectedProduct, setSelectedProduct] = useState<MenuProductDto | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const categoryRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // If not initialized, show session expired
  if (!isInitialized) {
    return <SessionExpired />;
  }

  // Error state
  if (error && !isLoading) {
    return <NetworkError message={error} onRetry={refetch} />;
  }

  // Get cart quantity for a product
  const getCartQuantity = (productId: number): number => {
    return cartItems
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle category tab click → scroll to section
  const handleCategorySelect = (categoryId: number) => {
    setActiveCategory(categoryId);
    const el = categoryRefs.current.get(categoryId);
    if (el) {
      const headerOffset = 140; // height of sticky header area
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product: MenuProductDto) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleGoToCart = () => {
    router.push(`/${storeSlug}/cart`);
  };

  return (
    <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#FAFAF8',
          borderBottom: '1px solid #E8E0D8',
        }}
      >
        {/* Top bar: Back + Store Name + Table */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 8px',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            <ChevronLeft size={22} color="#1A1A1A" />
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              {storeInfo?.name || 'Menu'}
            </h1>
            <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}>
              {tableInfo?.table_number}{tableInfo?.area ? ` • ${tableInfo.area}` : ''}
            </p>
          </div>

          <div style={{ width: 30 }} /> {/* Spacer for centering */}
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px 10px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm món..."
          />
        </div>

        {/* Category Tabs */}
        {!searchQuery && categories.length > 0 && (
          <div style={{ padding: '0 16px 10px' }}>
            <CategoryTabs
              categories={categories}
              activeId={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        )}
      </div>

      {/* Menu Content */}
      <div style={{ padding: '16px 16px 0' }}>
        {isLoading ? (
          /* Loading skeletons */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty search results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Store size={40} color="#D4B896" strokeWidth={1.5} />
            <p style={{ fontSize: 15, color: '#6B6B6B', marginTop: 16 }}>
              {searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có sản phẩm nào'}
            </p>
          </motion.div>
        ) : (
          /* Product list by category */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {filteredCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                ref={(el) => {
                  if (el) categoryRefs.current.set(category.id, el);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.05 }}
              >
                {/* Category Name */}
                {!searchQuery && (
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#1A1A1A',
                      margin: 0,
                      marginBottom: 12,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {category.name}
                  </h2>
                )}

                {/* Product Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {category.products.map((product, prodIndex) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.05 + prodIndex * 0.03 }}
                    >
                      <ProductCard
                        product={product}
                        onClick={() => handleProductClick(product)}
                        cartQuantity={getCartQuantity(product.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Bottom Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Floating Cart Button */}
      <AnimatePresence>
        <FloatingCartButton
          totalItems={getTotalItems()}
          totalAmount={getTotalAmount()}
          onClick={handleGoToCart}
        />
      </AnimatePresence>
    </div>
  );
}
