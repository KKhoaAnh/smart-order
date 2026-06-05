'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getMenu, getAllOptions } from '../lib/api';
import type { MenuCategoryDto, MenuProductDto, MenuOptionDto } from 'shared-types';

interface UseMenuOptions {
  storeId: number | null;
  enabled?: boolean;
}

interface UseMenuReturn {
  categories: MenuCategoryDto[];
  allProducts: MenuProductDto[];
  allOptions: MenuOptionDto[];
  filteredCategories: MenuCategoryDto[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: number | null;
  setActiveCategory: (id: number | null) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenu({ storeId, enabled = true }: UseMenuOptions): UseMenuReturn {
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [allOptions, setAllOptions] = useState<MenuOptionDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!storeId || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const [menuData, optionsData] = await Promise.all([
        getMenu(storeId),
        getAllOptions(),
      ]);

      setCategories(menuData);
      setAllOptions(optionsData);

      // Set first category as active if none selected
      if (!activeCategory && menuData.length > 0) {
        setActiveCategory(menuData[0].id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải menu';
      setError(message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, enabled]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Flatten all products from categories
  const allProducts = useMemo(() => {
    return categories.flatMap((cat) => cat.products);
  }, [categories]);

  // Filter categories and products by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();

    return categories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [categories, searchQuery]);

  return {
    categories,
    allProducts,
    allOptions,
    filteredCategories,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isLoading,
    error,
    refetch: fetchMenu,
  };
}
