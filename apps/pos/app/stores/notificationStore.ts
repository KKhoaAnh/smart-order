'use client';

import { create } from 'zustand';

/* ============================================================
   Notification Store — Quản lý thông báo POS
   ============================================================ */

export interface POSNotification {
  id: number;
  type: string;
  reference_id?: number;
  message?: string;
  is_read: boolean;
  store_id: number;
  created_at: string;
}

interface NotificationState {
  notifications: POSNotification[];
  unreadCount: number;

  setNotifications: (notifications: POSNotification[]) => void;
  addNotification: (notification: POSNotification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
