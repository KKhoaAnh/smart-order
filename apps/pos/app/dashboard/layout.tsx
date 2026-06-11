'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';
import { useUIStore } from '@/app/stores/uiStore';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import { useSocket } from '@/app/hooks/useSocket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  // Initialize WebSocket with store_id
  useSocket(user?.store_id);

  // Auth guard — redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.replace('/login');
    }
  }, [isAuthenticated, accessToken, router]);

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
