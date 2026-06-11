'use client';

import { usePathname } from 'next/navigation';
import { Bell, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '@/app/stores/authStore';
import { useNotificationStore } from '@/app/stores/notificationStore';
import { useUIStore } from '@/app/stores/uiStore';
import { Avatar } from '@/app/components/ui/Avatar';

const pageTitles: Record<string, string> = {
  '/dashboard/orders': 'Đơn hàng',
  '/dashboard/kitchen': 'Bếp',
  '/dashboard/menu': 'Thực đơn',
  '/dashboard/tables': 'Bàn & QR',
  '/dashboard/reports': 'Báo cáo',
  '/dashboard/reviews': 'Đánh giá',
  '/dashboard/users': 'Nhân viên',
  '/dashboard/settings': 'Cài đặt',
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const title = Object.entries(pageTitles).find(([k]) => pathname?.startsWith(k))?.[1] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 bg-bg-card/95 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-6 shadow-[0_1px_3px_rgba(111,78,55,0.06)]">
      {/* Left — Expand sidebar + Page Title */}
      <div className="flex items-center gap-3">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Mở rộng menu"
            title="Mở rộng menu"
            className="p-2 rounded-lg text-text-muted hover:bg-bg-secondary hover:text-brand-primary transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <Avatar name={user?.full_name} size="sm" />
          <span className="text-sm font-medium text-text-primary hidden md:block">
            {user?.full_name}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
