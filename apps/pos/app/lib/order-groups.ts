import { parseApiDate, VN_TIMEZONE } from 'shared-types';

export type OrderTimeSection = 'current' | 'today' | 'yesterday' | 'dayBefore' | 'week';

export interface OrderTimeSectionMeta {
  key: OrderTimeSection;
  label: string;
  /** Luôn hiển thị trong nội dung chính */
  pinned?: boolean;
}

export const ORDER_TIME_SECTIONS: OrderTimeSectionMeta[] = [
  { key: 'current', label: 'Hiện tại', pinned: true },
  { key: 'today', label: 'Hôm nay', pinned: true },
  { key: 'yesterday', label: 'Hôm qua' },
  { key: 'dayBefore', label: 'Hôm kia' },
  { key: 'week', label: '7 ngày trước' },
];

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED']);

function getDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE });
}

function getDaysAgo(date: Date, now = new Date()): number {
  const orderKey = getDateKey(date);
  const todayKey = getDateKey(now);

  if (orderKey === todayKey) return 0;

  const [oy, om, od] = orderKey.split('-').map(Number);
  const [ty, tm, td] = todayKey.split('-').map(Number);
  const orderUtc = Date.UTC(oy, om - 1, od);
  const todayUtc = Date.UTC(ty, tm - 1, td);

  return Math.round((todayUtc - orderUtc) / (24 * 60 * 60 * 1000));
}

export function getOrderTimeSection(order: { order_status?: string; payment_status?: string; created_at: string }): OrderTimeSection {
  // Đơn đang xử lý (PENDING / CONFIRMED) → luôn ở "Hiện tại"
  if (ACTIVE_STATUSES.has(order.order_status || 'PENDING')) {
    return 'current';
  }

  // Đơn hoàn thành nhưng chưa thanh toán → vẫn cần xử lý → "Hiện tại"
  if (order.order_status === 'COMPLETED' && order.payment_status !== 'PAID') {
    return 'current';
  }

  const daysAgo = getDaysAgo(parseApiDate(order.created_at));

  if (daysAgo === 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  if (daysAgo === 2) return 'dayBefore';
  if (daysAgo <= 7) return 'week';

  return 'week';
}

export function groupOrdersByTimeSection<T extends { order_status?: string; payment_status?: string; created_at: string }>(
  orders: T[],
): Record<OrderTimeSection, T[]> {
  const groups: Record<OrderTimeSection, T[]> = {
    current: [],
    today: [],
    yesterday: [],
    dayBefore: [],
    week: [],
  };

  for (const order of orders) {
    groups[getOrderTimeSection(order)].push(order);
  }

  for (const key of Object.keys(groups) as OrderTimeSection[]) {
    groups[key].sort(
      (a, b) => parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime(),
    );
  }

  return groups;
}
