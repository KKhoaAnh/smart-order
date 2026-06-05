'use client';

import React from 'react';

// ============================================================
// Button — Component nút bấm đa năng
// ============================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#6F4E37] text-white hover:bg-[#5C3D2E] active:bg-[#4A3125] shadow-sm hover:shadow-md',
  secondary:
    'bg-transparent border-2 border-[#6F4E37] text-[#6F4E37] hover:bg-[#D4B896]/20 active:bg-[#D4B896]/30',
  ghost:
    'bg-transparent text-[#6B6B6B] hover:bg-gray-100 active:bg-gray-200',
  danger:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-0.5 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center justify-center',
        'rounded-xl font-medium',
        'transition-all duration-200 ease-out',
        'active:scale-[0.97]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6F4E37]/50 focus-visible:ring-offset-2',
        'select-none',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Full width
        fullWidth ? 'w-full' : '',
        // Disabled
        isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer',
        // Custom
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}
