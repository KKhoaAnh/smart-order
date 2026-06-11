/* ============================================================
   Smart Order QR — Formatters
   Các hàm format hiển thị cho giao diện khách hàng
   ============================================================ */

import {
  parseApiDate,
  formatTimeVN,
  formatDateVN,
  formatDateTimeVN,
} from 'shared-types';

export { parseApiDate };

/**
 * Format giá tiền theo chuẩn Việt Nam.
 * @example formatPrice(29000) → '29.000đ'
 * @example formatPrice(150000) → '150.000đ'
 */
export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0,
    }).format(amount) + 'đ'
  );
}

/**
 * Format thời gian ngắn gọn (giờ:phút).
 * @example formatTime('2026-06-04T14:30:00') → '14:30'
 */
export function formatTime(date: string | Date): string {
  return formatTimeVN(date);
}

/** Format ngày theo múi giờ Việt Nam */
export function formatDate(date: string | Date): string {
  return formatDateVN(date);
}

/**
 * Format ngày giờ đầy đủ.
 * @example formatDateTime('2026-06-04T14:30:00') → '14:30 - 04/06/2026'
 */
export function formatDateTime(date: string | Date): string {
  return formatDateTimeVN(date);
}

/**
 * Format mã đơn hàng ngắn gọn.
 * @example formatOrderNumber('45') → '#045'
 * @example formatOrderNumber('7') → '#007'
 * @example formatOrderNumber('ORD-0125') → '#ORD-0125'
 */
export function formatOrderNumber(num: string): string {
  // Nếu chỉ là số thuần, pad zero
  if (/^\d+$/.test(num)) {
    return `#${num.padStart(3, '0')}`;
  }
  return `#${num}`;
}

/**
 * Trả về thời gian tương đối bằng tiếng Việt.
 * @example getRelativeTime(justNow) → 'vừa xong'
 * @example getRelativeTime(2minAgo) → '2 phút trước'
 * @example getRelativeTime(1hrAgo) → '1 giờ trước'
 */
export function getRelativeTime(date: string | Date): string {
  const d = parseApiDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 30) {
    return 'vừa xong';
  }

  if (diffSec < 60) {
    return `${diffSec} giây trước`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  }

  // Hơn 7 ngày → hiển thị ngày cụ thể
  return formatDateTime(d);
}
