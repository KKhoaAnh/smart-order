import React from 'react';

// ============================================================
// Skeleton — Placeholder loading với hiệu ứng shimmer
// ============================================================

type SkeletonVariant = 'card' | 'text' | 'circle' | 'rect';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantDefaults: Record<SkeletonVariant, { className: string; defaultWidth?: string; defaultHeight?: string }> = {
  card: {
    className: 'rounded-2xl',
    defaultWidth: '100%',
    defaultHeight: '8rem',
  },
  text: {
    className: 'rounded',
    defaultWidth: '75%',
    defaultHeight: '1rem',
  },
  circle: {
    className: 'rounded-full',
    defaultWidth: '3rem',
    defaultHeight: '3rem',
  },
  rect: {
    className: 'rounded-xl',
    defaultWidth: '100%',
    defaultHeight: '4rem',
  },
};

export function Skeleton({
  variant = 'rect',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const defaults = variantDefaults[variant];
  const resolvedWidth = width ?? defaults.defaultWidth;
  const resolvedHeight = height ?? defaults.defaultHeight;

  return (
    <>
      <div
        className={[
          'skeleton-shimmer',
          defaults.className,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth,
          height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
        }}
        aria-hidden="true"
        role="presentation"
      />

      {/* Inline style for shimmer animation — rendered once via CSS dedup */}
      <style jsx>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #f0ece8 25%,
            #faf8f5 37%,
            #f0ece8 63%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
}
