'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'cooking'
  | 'served'
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'admin'
  | 'cashier'
  | 'kitchen'
  | 'waiter';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F5F0EB] text-[#6F4E37]',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  cooking: 'bg-orange-50 text-orange-700 border border-orange-200',
  served: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  available: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  occupied: 'bg-red-50 text-red-600 border border-red-200',
  reserved: 'bg-amber-50 text-amber-600 border border-amber-200',
  cleaning: 'bg-blue-50 text-blue-600 border border-blue-200',
  admin: 'bg-[#1A1A1A] text-white',
  cashier: 'bg-[#6F4E37] text-white',
  kitchen: 'bg-blue-600 text-white',
  waiter: 'bg-emerald-600 text-white',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[#6F4E37]',
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-red-500',
  cooking: 'bg-orange-500',
  served: 'bg-emerald-500',
  available: 'bg-emerald-500',
  occupied: 'bg-red-500',
  reserved: 'bg-amber-500',
  cleaning: 'bg-blue-500',
  admin: 'bg-white',
  cashier: 'bg-white',
  kitchen: 'bg-white',
  waiter: 'bg-white',
};

export function Badge({
  variant = 'default',
  children,
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium leading-5 whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
