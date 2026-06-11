'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/stores/authStore';
import { useUIStore } from '@/app/stores/uiStore';
import { Coffee } from 'lucide-react';

/**
 * Providers — Hydrate tất cả Zustand stores từ localStorage MỘT LẦN DUY NHẤT
 * trước khi bất kỳ page nào render. Điều này đảm bảo:
 * 1. Không có hydration mismatch (server + client đều render loading ban đầu)
 * 2. Không có redirect loop (mọi page đều thấy đúng auth state)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateUI = useUIStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s._hydrated);
  const uiHydrated = useUIStore((s) => s._hydrated);

  useEffect(() => {
    hydrateAuth();
    hydrateUI();
  }, [hydrateAuth, hydrateUI]);

  // Block rendering cho đến khi stores đã hydrate xong
  if (!authHydrated || !uiHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center shadow-lg animate-pulse">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-text-muted font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
