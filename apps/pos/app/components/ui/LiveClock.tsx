'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { VN_TIMEZONE } from 'shared-types';

/**
 * LiveClock — Đồng hồ thời gian thực hiển thị giờ Việt Nam.
 * Cập nhật mỗi giây, hiển thị HH:mm:ss và ngày tháng.
 */
export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client only (avoid SSR hydration mismatch)
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!now) return null; // SSR placeholder

  const timeStr = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: VN_TIMEZONE,
  });

  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: VN_TIMEZONE,
  });

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-secondary/60 border border-border-light select-none">
      <Clock className="w-4 h-4 text-brand-primary" />
      <div className="flex flex-col items-end leading-none">
        <span className="text-sm font-semibold text-text-primary tabular-nums tracking-wide">
          {timeStr}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">
          {dateStr}
        </span>
      </div>
    </div>
  );
}
