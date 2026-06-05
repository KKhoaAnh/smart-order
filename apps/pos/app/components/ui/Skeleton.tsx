'use client';

import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({ className, width, height, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton rounded-lg', className)}
          style={{ width, height }}
        />
      ))}
    </>
  );
}

export default Skeleton;
