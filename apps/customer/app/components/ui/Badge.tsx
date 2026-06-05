'use client';

import React from 'react';

// ============================================================
// Badge — Nhãn trạng thái / tag sản phẩm
// ============================================================

type BadgeVariant =
  | 'default'
  | 'popular'
  | 'soldout'
  | 'pending'
  | 'cooking'
  | 'served'
  | 'success'
  | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-gray-100 text-gray-700',
  popular:
    'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm',
  soldout:
    'bg-gray-200 text-gray-500',
  pending:
    'bg-amber-100 text-amber-800',
  cooking:
    'bg-blue-100 text-blue-800',
  served:
    'bg-green-100 text-green-800',
  success:
    'bg-green-100 text-green-700',
  warning:
    'bg-amber-100 text-amber-700',
};

function SparkleIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z" />
    </svg>
  );
}

function CookingIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M12 2v4M8 4v2M16 4v2" />
      <path d="M3 10h18v2a8 8 0 0 1-16 0v-2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const variantIcons: Partial<Record<BadgeVariant, React.ReactNode>> = {
  popular: <SparkleIcon />,
  cooking: <CookingIcon />,
  served: <CheckIcon />,
  success: <CheckIcon />,
  pending: <ClockIcon />,
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const icon = variantIcons[variant];

  return (
    <span
      className={[
        'px-2 py-0.5 rounded-full text-xs font-medium',
        'inline-flex items-center gap-1',
        'whitespace-nowrap select-none',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      {children}
    </span>
  );
}
