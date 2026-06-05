'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/app/stores/uiStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <div
        className="transition-all duration-300 ease-smooth"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
