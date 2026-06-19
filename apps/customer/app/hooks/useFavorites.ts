'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCustomerAuthStore } from '../store/customer-auth-store';
import {
  getFavoriteIds,
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from '../lib/api';
import toast from 'react-hot-toast';

// ============================================================
// useFavorites — Quản lý yêu thích sản phẩm
// ============================================================

interface UseFavoritesReturn {
  favoriteIds: number[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
  isLoading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const { token, isAuthenticated } = useCustomerAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch danh sách yêu thích khi đăng nhập
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const ids = await getFavoriteIds(token);
      setFavoriteIds(ids);
    } catch {
      // Silent fail — không ảnh hưởng UX
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: number) => {
      if (!isAuthenticated || !token) {
        toast.error('Vui lòng đăng nhập để thêm yêu thích');
        return;
      }

      setIsLoading(true);
      try {
        if (favoriteIds.includes(productId)) {
          await removeFavoriteApi(token, productId);
          setFavoriteIds((prev) => prev.filter((id) => id !== productId));
          toast.success('Đã bỏ yêu thích');
        } else {
          await addFavoriteApi(token, productId);
          setFavoriteIds((prev) => [...prev, productId]);
          toast.success('Đã thêm vào yêu thích ❤️');
        }
      } catch {
        toast.error('Không thể cập nhật yêu thích');
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, token, favoriteIds],
  );

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isLoading,
  };
}
