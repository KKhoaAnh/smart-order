'use client';

import { useEffect, useState } from 'react';
import { parseApiDate } from '../lib/format';

/** Đếm giây đã trôi qua kể từ `since` (ISO), cập nhật mỗi giây khi `active`. */
export function useElapsedSeconds(since: string | undefined, active: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !since) {
      setElapsed(0);
      return;
    }

    const startMs = parseApiDate(since).getTime();
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since, active]);

  return elapsed;
}

export function formatElapsedClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
