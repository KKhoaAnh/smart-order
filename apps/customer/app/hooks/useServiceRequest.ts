'use client';

import { useState, useCallback } from 'react';
import { createServiceRequest } from '../lib/api';
import { useSessionStore } from '../store/session-store';
import toast from 'react-hot-toast';

interface UseServiceRequestReturn {
  sendCallStaff: (message?: string) => Promise<boolean>;
  sendRequestBill: (message?: string) => Promise<boolean>;
  sendOtherRequest: (message: string) => Promise<boolean>;
  isLoading: boolean;
}

export function useServiceRequest(): UseServiceRequestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { sessionToken } = useSessionStore();

  const sendRequest = useCallback(
    async (requestType: string, message?: string): Promise<boolean> => {
      if (!sessionToken) {
        toast.error('Phiên đặt món đã hết hạn');
        return false;
      }

      setIsLoading(true);

      try {
        await createServiceRequest({
          session_token: sessionToken,
          request_type: requestType,
          message: message || undefined,
        });

        const labels: Record<string, string> = {
          CALL_STAFF: 'Đã gọi nhân viên! Vui lòng chờ...',
          REQUEST_BILL: 'Đã yêu cầu tính tiền! Nhân viên sẽ đến ngay.',
          OTHER: 'Yêu cầu đã được gửi!',
        };

        toast.success(labels[requestType] || 'Yêu cầu đã được gửi!', {
          icon: requestType === 'CALL_STAFF' ? '🔔' : requestType === 'REQUEST_BILL' ? '💳' : '📝',
          duration: 4000,
        });

        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Không thể gửi yêu cầu');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionToken]
  );

  const sendCallStaff = useCallback(
    (message?: string) => sendRequest('CALL_STAFF', message),
    [sendRequest]
  );

  const sendRequestBill = useCallback(
    (message?: string) => sendRequest('REQUEST_BILL', message),
    [sendRequest]
  );

  const sendOtherRequest = useCallback(
    (message: string) => sendRequest('OTHER', message),
    [sendRequest]
  );

  return {
    sendCallStaff,
    sendRequestBill,
    sendOtherRequest,
    isLoading,
  };
}
