const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

function toUtcIsoString(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (/[Zz]$/.test(trimmed) || /[+-]\d{2}(:?\d{2})?$/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }

  if (ISO_DATE_PREFIX.test(trimmed)) {
    return new Date(`${trimmed.replace(' ', 'T')}Z`).toISOString();
  }

  return new Date(trimmed).toISOString();
}

/** Chuyển mọi Date / chuỗi timestamp trong response thành ISO UTC (có Z). */
export function serializeDates<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (typeof value === 'string' && ISO_DATE_PREFIX.test(value.trim())) {
    return toUtcIsoString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDates(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = serializeDates(nested);
    }
    return result as T;
  }

  return value;
}
