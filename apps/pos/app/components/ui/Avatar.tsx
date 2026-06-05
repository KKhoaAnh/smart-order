'use client';

import { cn, getInitials } from '@/app/lib/utils';

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
const colors = [
  'bg-brand-primary',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-error',
  'bg-brand-secondary',
];

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 'md', online, className }: AvatarProps) {
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        sizeMap[size],
        !src && bg,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name || ''}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{getInitials(name || '?')}</span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white" />
      )}
    </div>
  );
}

export default Avatar;
