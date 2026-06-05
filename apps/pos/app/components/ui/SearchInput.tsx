'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);

  const debouncedOnChange = useCallback(
    (val: string) => {
      const timer = setTimeout(() => onChange(val), 300);
      return () => clearTimeout(timer);
    },
    [onChange]
  );

  useEffect(() => {
    const cleanup = debouncedOnChange(local);
    return cleanup;
  }, [local, debouncedOnChange]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-8 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 transition-all"
      />
      {local && (
        <button
          onClick={() => {
            setLocal('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
