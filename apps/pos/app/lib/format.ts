/* ============================================================
   Smart Order POS — Formatters (Vietnamese locale)
   ============================================================ */

import {
  parseApiDate,
  formatTimeVN,
  formatDateVN,
  formatDateTimeVN,
} from 'shared-types';

export { parseApiDate };

/** Format giá tiền: 45000 → "45.000đ" */
export function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + 'đ';
}

/** Format tiền lớn: 1500000 → "1.500.000đ" */
export function formatCurrency(amount: number): string {
  return formatPrice(amount);
}

/** Format phần trăm: 12.5 → "12,5%" */
export function formatPercent(value: number): string {
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
}

/** Format mã đơn: 45 → "#045" */
export function formatOrderNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return `#${num}`;
  return `#${String(n).padStart(3, '0')}`;
}

/** Format giờ theo múi giờ Việt Nam */
export function formatTime(date: string | Date): string {
  return formatTimeVN(date);
}

/** Format ngày theo múi giờ Việt Nam */
export function formatDate(date: string | Date): string {
  return formatDateVN(date);
}

/** Format ngày giờ: → "14:30 - 04/06/2026" */
export function formatDateTime(date: string | Date): string {
  return formatDateTimeVN(date);
}

/** Format tương đối: → "Vừa xong", "5 phút trước" */
export function getRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = parseApiDate(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return formatDateTime(date);
}

/** Format bàn: 7 → "Bàn 7" */
export function formatTableNumber(num: number | string): string {
  return `Bàn ${num}`;
}
