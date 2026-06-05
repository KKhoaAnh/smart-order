'use client';

import React, { useCallback } from 'react';

// ============================================================
// QuantitySelector — Chọn số lượng với nút +/-
// ============================================================

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  const handleDecrement = useCallback(() => {
    if (!isAtMin) {
      onChange(value - 1);
    }
  }, [value, isAtMin, onChange]);

  const handleIncrement = useCallback(() => {
    if (!isAtMax) {
      onChange(value + 1);
    }
  }, [value, isAtMax, onChange]);

  return (
    <div className="inline-flex items-center gap-3">
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        aria-label="Giảm số lượng"
        className={[
          'w-8 h-8 rounded-full',
          'flex items-center justify-center',
          'border-2 border-[#6F4E37]',
          'transition-all duration-150 ease-out',
          'select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6F4E37]/50',
          isAtMin
            ? 'opacity-30 cursor-not-allowed'
            : 'cursor-pointer active:scale-90 hover:bg-[#6F4E37]/10',
        ]
          .join(' ')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6F4E37"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Value Display */}
      <span
        className="w-8 text-center text-base font-semibold text-[#1A1A1A] tabular-nums select-none"
        aria-live="polite"
        aria-label={`Số lượng: ${value}`}
      >
        {value}
      </span>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        aria-label="Tăng số lượng"
        className={[
          'w-8 h-8 rounded-full',
          'flex items-center justify-center',
          'border-2 border-[#6F4E37] bg-[#6F4E37]',
          'transition-all duration-150 ease-out',
          'select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6F4E37]/50',
          isAtMax
            ? 'opacity-30 cursor-not-allowed'
            : 'cursor-pointer active:scale-90 hover:bg-[#5C3D2E]',
        ]
          .join(' ')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
