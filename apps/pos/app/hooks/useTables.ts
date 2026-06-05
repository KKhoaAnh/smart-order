'use client';

import { useState, useCallback } from 'react';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  regenerateQR,
  updateTableStatus,
} from '@/app/lib/api';
import toast from 'react-hot-toast';

export function useTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTables();
      setTables(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTbl = async (data: any) => {
    await createTable(data);
    toast.success('Đã thêm bàn');
    await fetchTables();
  };

  const updateTbl = async (id: number, data: any) => {
    await updateTable(id, data);
    toast.success('Đã cập nhật bàn');
    await fetchTables();
  };

  const deleteTbl = async (id: number) => {
    await deleteTable(id);
    toast.success('Đã xoá bàn');
    await fetchTables();
  };

  const regenQR = async (id: number) => {
    await regenerateQR(id);
    toast.success('Đã tạo lại mã QR');
    await fetchTables();
  };

  const updateStatus = async (id: number, status: string) => {
    await updateTableStatus(id, status);
    toast.success('Đã cập nhật trạng thái');
    await fetchTables();
  };

  return { tables, loading, fetchTables, createTbl, updateTbl, deleteTbl, regenQR, updateStatus };
}

export default useTables;
