import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ============================================================
   Smart Order POS — Utilities
   ============================================================ */

/** Merge Tailwind class names */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Debounce function */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Get initials from name: "Nguyễn Văn An" → "NA" */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Map role to Tailwind color classes */
export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    Admin: 'bg-gray-900 text-white',
    Cashier: 'bg-brand-primary text-white',
    Kitchen: 'bg-info text-white',
    Waiter: 'bg-success text-white',
  };
  return map[role] || 'bg-gray-200 text-gray-700';
}

/** Map role to Vietnamese label */
export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    Admin: 'Quản lý',
    Cashier: 'Thu ngân',
    Kitchen: 'Bếp',
    Waiter: 'Phục vụ',
  };
  return map[role] || role;
}

/** Promise-based delay */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simple unique ID generator */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
