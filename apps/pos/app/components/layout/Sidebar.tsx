'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Coffee,
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  LayoutGrid,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn, getRoleLabel } from '@/app/lib/utils';
import { Avatar } from '@/app/components/ui/Avatar';
import { useAuthStore } from '@/app/stores/authStore';
import { useUIStore } from '@/app/stores/uiStore';

const navItems = [
  { icon: ClipboardList, label: 'Đơn hàng', href: '/dashboard/orders' },
  { icon: ChefHat, label: 'Bếp', href: '/dashboard/kitchen' },
  { icon: UtensilsCrossed, label: 'Thực đơn', href: '/dashboard/menu' },
  { icon: LayoutGrid, label: 'Bàn & QR', href: '/dashboard/tables' },
  { icon: BarChart3, label: 'Báo cáo', href: '/dashboard/reports' },
  { icon: Users, label: 'Nhân viên', href: '/dashboard/users', adminOnly: true },
  { icon: Settings, label: 'Cài đặt', href: '/dashboard/settings', adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen bg-[#1A1A1A] z-40 flex flex-col overflow-hidden"
    >
      {/* ── Logo ──────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="font-display text-white text-base font-bold leading-tight">
              Smart Order
            </span>
            <span className="text-[10px] text-brand-light font-medium tracking-wider uppercase">
              POS System
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Navigation ────────────────── */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto sidebar-scroll">
        <div className="space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin())
            .map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-[#3D2B1F] text-white border-l-[3px] border-brand-primary'
                      : 'text-[#9CA3AF] hover:bg-[#2D2D2D] hover:text-white border-l-[3px] border-transparent'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
        </div>
      </nav>

      {/* ── Collapse Toggle ───────────── */}
      <div className="px-2 py-2 border-t border-white/10">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[#9CA3AF] hover:text-white hover:bg-[#2D2D2D] rounded-lg transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span className="text-sm">Thu gọn</span>
            </>
          )}
        </button>
      </div>

      {/* ── User Info ─────────────────── */}
      <div className="px-3 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={user?.full_name || 'User'} size="sm" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'Người dùng'}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {user?.roles?.[0] ? getRoleLabel(user.roles[0]) : ''}
              </p>
            </div>
          )}
          <button
            onClick={clearAuth}
            className="p-1.5 text-[#9CA3AF] hover:text-red-400 hover:bg-[#2D2D2D] rounded-lg transition-colors shrink-0"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
