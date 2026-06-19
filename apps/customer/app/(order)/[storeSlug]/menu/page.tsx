'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Store, Heart, Clock, Sparkles } from 'lucide-react';
import { useSessionStore } from '../../../store/session-store';
import { useCartStore } from '../../../store/cart-store';
import { useCustomerAuthStore } from '../../../store/customer-auth-store';
import { useMenu } from '../../../hooks/useMenu';
import { useFavorites } from '../../../hooks/useFavorites';
import { useHistory } from '../../../hooks/useHistory';
import { getActivePromotions } from '../../../lib/api';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { FloatingCartButton } from './components/FloatingCartButton';
import { PromotionBanner, type ActivePromotion } from './components/PromotionBanner';
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activePromotions, setActivePromotions] = useState<ActivePromotion[]>([]);
  const categoryRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Favorites & history (chỉ khi đã đăng nhập)
  const { isAuthenticated } = useCustomerAuthStore();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { frequentProducts } = useHistory();

  useEffect(() => {
    if (!storeInfo?.id) return;
    getActivePromotions(storeInfo.id)
      .then((data) => setActivePromotions(Array.isArray(data) ? data : []))
      .catch(() => setActivePromotions([]));
  }, [storeInfo?.id]);

  // Lọc danh mục theo yêu thích
  const displayCategories = useMemo(() => {
    if (!showFavoritesOnly) return filteredCategories;
    return filteredCategories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter((p) => favoriteIds.includes(p.id)),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [filteredCategories, showFavoritesOnly, favoriteIds]);

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

        {/* Quick filter: Favorites + History (only if authenticated) */}
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 8px' }}>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 20,
                border: showFavoritesOnly ? '1.5px solid #EF4444' : '1px solid #E8E0D8',
                backgroundColor: showFavoritesOnly ? '#FEF2F2' : '#FFFFFF',
                color: showFavoritesOnly ? '#EF4444' : '#6B6B6B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Heart size={12} fill={showFavoritesOnly ? '#EF4444' : 'none'} />
              Yêu thích {favoriteIds.length > 0 && `(${favoriteIds.length})`}
            </button>
            <button
              onClick={() => router.push(`/${storeSlug}/history`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid #E8E0D8',
                backgroundColor: '#FFFFFF',
                color: '#6B6B6B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Clock size={12} />
              Lịch sử
            </button>
          </div>
        )}

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

      {/* Promotion — ngoài sticky header để tránh giật khi cuộn */}
      {!searchQuery && activePromotions.length > 0 && (
        <PromotionBanner promotions={activePromotions} />
      )}

      {/* Menu Content */}
      <div style={{ padding: '16px 16px 0' }}>
        {isLoading ? (
          /* Loading skeletons */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : displayCategories.length === 0 ? (
          /* Empty search/filter results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {showFavoritesOnly ? (
              <>
                <Heart size={40} color="#D4B896" strokeWidth={1.5} />
                <p style={{ fontSize: 15, color: '#6B6B6B', marginTop: 16 }}>
                  Chưa có món yêu thích nào
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                  Nhấn ❤️ trên sản phẩm để thêm vào yêu thích
                </p>
              </>
            ) : (
              <>
                <Store size={40} color="#D4B896" strokeWidth={1.5} />
                <p style={{ fontSize: 15, color: '#6B6B6B', marginTop: 16 }}>
                  {searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có sản phẩm nào'}
                </p>
              </>
            )}
          </motion.div>
        ) : (
          /* Product list by category */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Frequent products section */}
            {!searchQuery && !showFavoritesOnly && isAuthenticated && frequentProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <Sparkles size={18} color="#D97706" />
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#1A1A1A',
                      margin: 0,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Thường đặt
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {frequentProducts.slice(0, 3).map((fp, fpIndex) => {
                    // Tìm product trong allProducts để có đầy đủ data cho ProductDetailSheet
                    const fullProduct = filteredCategories
                      .flatMap((c) => c.products)
                      .find((p) => p.id === fp.product_id);
                    if (!fullProduct) return null;

                    return (
                      <motion.div
                        key={fp.product_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: fpIndex * 0.05 }}
                      >
                        <ProductCard
                          product={fullProduct}
                          onClick={() => handleProductClick(fullProduct)}
                          cartQuantity={getCartQuantity(fullProduct.id)}
                          isFavorite={isFavorite(fullProduct.id)}
                          onToggleFavorite={() => toggleFavorite(fullProduct.id)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {displayCategories.map((category, catIndex) => (
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
                        isFavorite={isAuthenticated ? isFavorite(product.id) : undefined}
                        onToggleFavorite={isAuthenticated ? () => toggleFavorite(product.id) : undefined}
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
