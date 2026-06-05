/* ============================================================
   Smart Order POS — API Client (with JWT)
   ============================================================ */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ── Custom Error ─────────────────────────────────────────── */

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/* ── Auth Token Helper ────────────────────────────────────── */

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pos_token');
  } catch {
    return null;
  }
}

/* ── Generic Fetch Wrapper ────────────────────────────────── */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}/api/${endpoint.replace(/^\//, '')}`;

  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(url, { ...options, headers });

  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ', res.status);
  }

  if (!res.ok || !body.success) {
    throw new ApiError(
      body.message || `Lỗi ${res.status}`,
      res.status,
      (body as unknown as { errors?: Record<string, string[]> }).errors,
    );
  }

  return body.data;
}

/* ============================================================
   Auth
   ============================================================ */

export function login(username: string, password: string) {
  return apiFetch<{
    access_token: string;
    user: {
      id: number;
      username: string;
      full_name: string;
      phone?: string;
      store_id: number;
      roles: string[];
      is_active: boolean;
    };
  }>('auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getProfile() {
  return apiFetch<any>('auth/profile');
}

/* ============================================================
   Store
   ============================================================ */

export function getStore() {
  return apiFetch<any>('store');
}

export function updateStore(id: number, data: Record<string, any>) {
  return apiFetch<any>(`store/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/* ============================================================
   Tables
   ============================================================ */

export function getTables() {
  return apiFetch<any[]>('tables');
}

export function getTable(id: number) {
  return apiFetch<any>(`tables/${id}`);
}

export function createTable(data: Record<string, any>) {
  return apiFetch<any>('tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTable(id: number, data: Record<string, any>) {
  return apiFetch<any>(`tables/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTable(id: number) {
  return apiFetch<any>(`tables/${id}`, { method: 'DELETE' });
}

export function regenerateQR(id: number) {
  return apiFetch<any>(`tables/${id}/regenerate-qr`, { method: 'PATCH' });
}

export function updateTableStatus(id: number, status: string) {
  return apiFetch<any>(`tables/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* ============================================================
   Menu
   ============================================================ */

export function getMenu(storeId: number) {
  return apiFetch<any[]>(`menu/store/${storeId}`);
}

export function getMenuOptions() {
  return apiFetch<any[]>('menu/options');
}

export function getCategories(storeId: number) {
  return apiFetch<any[]>(`menu/categories/${storeId}`);
}

export function createCategory(storeId: number, data: Record<string, any>) {
  return apiFetch<any>(`menu/categories/${storeId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCategory(id: number, data: Record<string, any>) {
  return apiFetch<any>(`menu/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id: number) {
  return apiFetch<any>(`menu/categories/${id}`, { method: 'DELETE' });
}

export function createProduct(data: Record<string, any>) {
  return apiFetch<any>('menu/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: number, data: Record<string, any>) {
  return apiFetch<any>(`menu/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: number) {
  return apiFetch<any>(`menu/products/${id}`, { method: 'DELETE' });
}

export function toggleAvailability(id: number) {
  return apiFetch<any>(`menu/products/${id}/toggle-availability`, {
    method: 'PATCH',
  });
}

/* ============================================================
   Orders
   ============================================================ */

export function getStoreOrders(storeId: number, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return apiFetch<any[]>(`orders/store/${storeId}${qs ? `?${qs}` : ''}`);
}

export function getOrderDetail(id: number) {
  return apiFetch<any>(`orders/${id}`);
}

export function updateOrderStatus(id: number, data: { status: string; reject_reason?: string }) {
  return apiFetch<any>(`orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateItemStatus(itemId: number, data: { item_status: string }) {
  return apiFetch<any>(`orders/items/${itemId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function processPayment(orderId: number) {
  return apiFetch<any>(`orders/${orderId}/pay`, {
    method: 'POST',
  });
}

/* ============================================================
   Service Requests
   ============================================================ */

export function getServiceRequests(storeId: number, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return apiFetch<any[]>(`service-requests/store/${storeId}${qs ? `?${qs}` : ''}`);
}

export function acknowledgeRequest(id: number) {
  return apiFetch<any>(`service-requests/${id}/acknowledge`, { method: 'PATCH' });
}

export function resolveRequest(id: number) {
  return apiFetch<any>(`service-requests/${id}/resolve`, { method: 'PATCH' });
}

/* ============================================================
   Notifications
   ============================================================ */

export function getNotifications() {
  return apiFetch<any[]>('notifications');
}

export function getUnreadCount() {
  return apiFetch<{ count: number }>('notifications/count');
}

export function markNotificationRead(id: number) {
  return apiFetch<any>(`notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return apiFetch<any>('notifications/read-all', { method: 'PATCH' });
}
