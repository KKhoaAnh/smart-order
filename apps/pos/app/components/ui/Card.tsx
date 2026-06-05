'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({ children, className, hover, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-bg-card border border-border rounded-xl shadow-card transition-all duration-200',
        paddingMap[padding],
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;
