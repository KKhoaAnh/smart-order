'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { useAuthStore } from '@/app/stores/authStore';
import { connectSocket, joinStoreRoom, disconnectSocket } from '@/app/lib/socket';
import { Coffee } from 'lucide-react';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Init socket
    connectSocket();
    if (user?.store_id) {
      joinStoreRoom(user.store_id, user.roles?.[0]);
    }

    setReady(true);

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3 animate-pulse-soft">
          <Coffee className="w-10 h-10 text-brand-primary" />
          <span className="text-sm text-text-muted">Đang tải...</span>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
