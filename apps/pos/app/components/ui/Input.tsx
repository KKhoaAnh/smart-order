'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#4A4A4A]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(' ') || undefined
            }
            className={cn(
              'flex h-10 w-full rounded-lg border bg-white px-3 py-2',
              'text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                : 'border-[#E5E5E5] focus:border-[#A0785D] focus:ring-[#A0785D]/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              disabled && 'opacity-50 cursor-not-allowed bg-[#F9FAFB]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-[#9CA3AF]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
