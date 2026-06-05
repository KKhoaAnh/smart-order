'use client';

import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Tìm kiếm món...' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: isFocused ? '#FFFFFF' : '#F5F0EB',
          borderRadius: 14,
          padding: '10px 14px',
          border: `1.5px solid ${isFocused ? '#A0785D' : 'transparent'}`,
          transition: 'all 0.2s ease',
          boxShadow: isFocused ? '0 4px 12px rgba(111, 78, 55, 0.08)' : 'none',
        }}
      >
        <Search size={18} color={isFocused ? '#6F4E37' : '#9CA3AF'} style={{ flexShrink: 0 }} />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: 14,
            color: '#1A1A1A',
            fontFamily: 'inherit',
          }}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={16} color="#9CA3AF" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
