'use client';

import { useState, useCallback } from 'react';
import {
  getMenu,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getMenuOptions,
} from '@/app/lib/api';
import toast from 'react-hot-toast';

export function useMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMenu = useCallback(async (storeId: number) => {
    setLoading(true);
    try {
      const data = await getMenu(storeId);
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải thực đơn');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const data = await getMenuOptions();
      setOptions(data);
    } catch {}
  }, []);

  const fetchCategories = useCallback(async (storeId: number) => {
    try {
      const data = await getCategories(storeId);
      setCategories(data);
    } catch {}
  }, []);

  const createCat = async (storeId: number, data: any) => {
    await createCategory(storeId, data);
    toast.success('Đã thêm danh mục');
    await fetchMenu(storeId);
  };

  const updateCat = async (id: number, data: any, storeId: number) => {
    await updateCategory(id, data);
    toast.success('Đã cập nhật danh mục');
    await fetchMenu(storeId);
  };

  const deleteCat = async (id: number, storeId: number) => {
    await deleteCategory(id);
    toast.success('Đã xoá danh mục');
    await fetchMenu(storeId);
  };

  const createProd = async (data: any, storeId: number) => {
    await createProduct(data);
    toast.success('Đã thêm sản phẩm');
    await fetchMenu(storeId);
  };

  const updateProd = async (id: number, data: any, storeId: number) => {
    await updateProduct(id, data);
    toast.success('Đã cập nhật sản phẩm');
    await fetchMenu(storeId);
  };

  const deleteProd = async (id: number, storeId: number) => {
    await deleteProduct(id);
    toast.success('Đã xoá sản phẩm');
    await fetchMenu(storeId);
  };

  const toggleAvail = async (id: number, storeId: number) => {
    await toggleAvailability(id);
    toast.success('Đã cập nhật trạng thái');
    await fetchMenu(storeId);
  };

  return {
    categories,
    options,
    loading,
    fetchMenu,
    fetchOptions,
    fetchCategories,
    createCat,
    updateCat,
    deleteCat,
    createProd,
    updateProd,
    deleteProd,
    toggleAvail,
  };
}

export default useMenu;
