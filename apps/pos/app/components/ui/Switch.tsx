'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Chuyển đổi'}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2',
          checked ? 'bg-brand-primary' : 'bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
          style={{ marginTop: 2 }}
          animate={{
            x: checked ? 22 : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          className={cn(
            'text-sm text-text-secondary cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Switch;
