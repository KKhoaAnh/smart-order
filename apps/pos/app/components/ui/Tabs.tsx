'use client';

import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
            tab.key === activeKey
              ? 'text-brand-primary'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  tab.key === activeKey
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'bg-bg-secondary text-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {tab.key === activeKey && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
