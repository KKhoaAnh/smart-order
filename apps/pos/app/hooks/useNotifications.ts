'use client';

import { useCallback } from 'react';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/app/lib/api';
import { useNotificationStore } from '@/app/stores/notificationStore';
import toast from 'react-hot-toast';

export function useNotifications() {
  const { setNotifications, markAsRead, markAllAsRead, setUnreadCount } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {}
  }, [setNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {}
  }, [setUnreadCount]);

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      markAsRead(id);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      markAllAsRead();
      toast.success('Đã đọc tất cả thông báo');
    } catch {}
  };

  return { fetchNotifications, fetchUnreadCount, markRead, markAllRead };
}

export default useNotifications;
