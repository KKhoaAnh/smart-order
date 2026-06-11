'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';
import { Coffee } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  // Store đã được Providers hydrate — giá trị luôn chính xác
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard/orders');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      <div className="animate-bounce-in flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center shadow-lg">
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Smart Order
        </h1>
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse-soft" />
          Đang tải...
        </div>
      </div>
    </div>
  );
}
