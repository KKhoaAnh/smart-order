'use client';

import { useEffect, useState } from 'react';

/** Trigger re-render mỗi phút — dùng cho thời gian chờ, relative time, v.v. */
export function useMinuteTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const scheduleNext = () => {
      const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
      return window.setTimeout(() => {
        setTick((n) => n + 1);
        timerId = scheduleNext();
      }, msUntilNextMinute);
    };

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, []);
}
