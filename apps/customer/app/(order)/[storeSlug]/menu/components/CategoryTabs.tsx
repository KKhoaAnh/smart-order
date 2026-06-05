'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  categories: { id: number; name: string }[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const tab = activeTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();

      const scrollLeft =
        tab.offsetLeft - container.offsetLeft - containerRect.width / 2 + tabRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        padding: '4px 0',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <motion.button
            key={cat.id}
            ref={isActive ? activeTabRef : undefined}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            style={{
              flexShrink: 0,
              padding: '8px 18px',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              backgroundColor: isActive ? '#6F4E37' : '#F5F0EB',
              color: isActive ? '#FFFFFF' : '#6B6B6B',
              boxShadow: isActive ? '0 4px 12px rgba(111, 78, 55, 0.2)' : 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {cat.name}
          </motion.button>
        );
      })}
    </div>
  );
}
