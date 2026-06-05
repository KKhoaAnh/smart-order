'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder = 'Chọn một mục...',
      className,
      wrapperClassName,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#4A4A4A]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10',
              'text-sm text-[#1A1A1A]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                : 'border-[#E5E5E5] focus:border-[#A0785D] focus:ring-[#A0785D]/20',
              disabled && 'opacity-50 cursor-not-allowed bg-[#F9FAFB]',
              !value && 'text-[#9CA3AF]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
