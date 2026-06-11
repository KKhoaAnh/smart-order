'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Coffee,
  Star,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { cn } from '@/app/lib/utils';
import { useUIStore } from '@/app/stores/uiStore';

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
  description?: string;
}

const menuItems: MenuItem[] = [
  { href: '/dashboard/orders', label: 'Đơn hàng', icon: ClipboardList, description: 'Quản lý đơn' },
  { href: '/dashboard/kitchen', label: 'Bếp', icon: ChefHat, description: 'Kitchen Display' },
  { href: '/dashboard/menu', label: 'Thực đơn', icon: UtensilsCrossed, description: 'Xem & quản lý' },
  { href: '/dashboard/tables', label: 'Bàn & QR', icon: QrCode, description: 'Sơ đồ bàn' },
  { href: '/dashboard/reviews', label: 'Đánh giá', icon: Star, adminOnly: true, description: 'Feedback khách' },
  { href: '/dashboard/reports', label: 'Báo cáo', icon: BarChart3, adminOnly: true, description: 'Thống kê' },
  { href: '/dashboard/users', label: 'Nhân viên', icon: Users, adminOnly: true, description: 'Quản lý' },
  { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings, adminOnly: true, description: 'Hệ thống' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user, isAdmin } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter menu items based on role
  const visibleItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col overflow-hidden',
        'bg-white border-r border-border',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* ── Logo Section ── */}
      <div
        className={cn(
          'border-b border-border flex-shrink-0',
          sidebarCollapsed
            ? 'flex flex-col items-center justify-center gap-1.5 py-3 px-1'
            : 'flex items-center gap-3 px-4 h-16'
        )}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Coffee className="w-5 h-5 text-white" style={{ animation: 'pulse-subtle 3s ease-in-out infinite' }} />
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <span className="font-bold text-text-primary text-lg whitespace-nowrap tracking-tight">
              Smart Order
            </span>
            <p className="text-[10px] text-brand-secondary font-medium whitespace-nowrap -mt-0.5">
              POS Management
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          title={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className={cn(
            'rounded-lg hover:bg-bg-secondary transition-all duration-200 text-text-muted hover:text-brand-primary',
            sidebarCollapsed ? 'p-2' : 'p-1.5 ml-auto'
          )}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Menu Items ── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Menu
          </p>
        )}
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const isHovered = hoveredItem === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'sidebar-item group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative',
                isActive
                  ? 'active text-brand-primary'
                  : 'text-text-secondary hover:text-brand-primary'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: mounted ? 'slide-in-left 0.3s ease-out both' : 'none',
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {/* Active glow background */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/8 to-transparent pointer-events-none" />
              )}

              {/* Icon */}
              <div className={cn(
                'relative flex-shrink-0 transition-transform duration-200',
                isActive && 'scale-110',
                isHovered && !isActive && 'scale-105'
              )}>
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive
                      ? 'text-brand-primary'
                      : 'text-text-muted group-hover:text-brand-secondary'
                  )}
                />
              </div>

              {/* Label */}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span className="block truncate relative z-10">{item.label}</span>
                </div>
              )}

              {/* Active indicator dot */}
              {isActive && !sidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
              )}

              {/* Tooltip when collapsed */}
              {sidebarCollapsed && isHovered && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-brand-dark text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-brand-dark rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Info + Logout ── */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl',
            sidebarCollapsed ? 'justify-center px-0' : ''
          )}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xs font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.full_name || user?.username || 'User'}
              </p>
              <p className="text-[10px] text-text-muted truncate font-medium">
                {user?.roles?.[0] || 'Staff'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-text-muted hover:text-error hover:bg-error-bg transition-all duration-200',
            sidebarCollapsed && 'justify-center px-0'
          )}
          title={sidebarCollapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
