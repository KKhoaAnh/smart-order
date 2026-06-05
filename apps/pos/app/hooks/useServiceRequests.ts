'use client';

import { useState, useCallback } from 'react';
import { getServiceRequests, acknowledgeRequest, resolveRequest } from '@/app/lib/api';
import toast from 'react-hot-toast';

export function useServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async (storeId: number) => {
    setLoading(true);
    try {
      const data = await getServiceRequests(storeId);
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải yêu cầu phục vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledge = async (id: number, storeId: number) => {
    await acknowledgeRequest(id);
    toast.success('Đã tiếp nhận yêu cầu');
    await fetchRequests(storeId);
  };

  const resolve = async (id: number, storeId: number) => {
    await resolveRequest(id);
    toast.success('Đã xử lý yêu cầu');
    await fetchRequests(storeId);
  };

  return { requests, loading, fetchRequests, acknowledge, resolve };
}

export default useServiceRequests;
