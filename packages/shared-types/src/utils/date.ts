/** Múi giờ mặc định của hệ thống (Việt Nam) */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Parse chuỗi ngày từ API.
 * PostgreSQL/TypeORM thường trả timestamp không kèm offset — coi là UTC rồi hiển thị theo VN.
 */
export function parseApiDate(input: string | Date): Date {
  if (input instanceof Date) return input;

  const value = String(input).trim();
  if (!value) return new Date(NaN);

  if (/[Zz]$/.test(value) || /[+-]\d{2}(:?\d{2})?$/.test(value)) {
    return new Date(value);
  }

  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
    return new Date(value.replace(' ', 'T') + 'Z');
  }

  return new Date(value);
}

export function formatTimeVN(date: string | Date): string {
  return parseApiDate(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VN_TIMEZONE,
  });
}

export function formatDateVN(date: string | Date): string {
  return parseApiDate(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: VN_TIMEZONE,
  });
}

export function formatDateTimeVN(date: string | Date): string {
  return `${formatTimeVN(date)} - ${formatDateVN(date)}`;
}
