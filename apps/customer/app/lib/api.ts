import type {
  InitSessionResponseDto,
  CreateOrderDto,
  AddOrderItemsDto,
  CreateServiceRequestDto,
  MenuCategoryDto,
  MenuProductDto,
  MenuOptionDto,
} from 'shared-types';

/* ============================================================
   Smart Order QR — API Client
   ============================================================ */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ============================================================
   Custom Error
   ============================================================ */

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/* ============================================================
   Generic Fetch Wrapper
   ============================================================ */

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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let body: ApiResponse<T>;

  try {
    body = await res.json();
  } catch {
    throw new ApiError(
      'Không thể kết nối đến máy chủ',
      res.status,
    );
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
   Session
   ============================================================ */

export function initSession(
  qrToken: string,
  fingerprint?: string,
): Promise<InitSessionResponseDto> {
  return apiFetch<InitSessionResponseDto>('sessions/init', {
    method: 'POST',
    body: JSON.stringify({
      qr_token: qrToken,
      device_fingerprint: fingerprint,
    }),
  });
}

/* ============================================================
   Menu
   ============================================================ */

export function getMenu(storeId: number): Promise<MenuCategoryDto[]> {
  return apiFetch<MenuCategoryDto[]>(`menu/store/${storeId}`);
}

export function getProduct(productId: number): Promise<MenuProductDto> {
  return apiFetch<MenuProductDto>(`menu/products/${productId}`);
}

export function getAllOptions(): Promise<MenuOptionDto[]> {
  return apiFetch<MenuOptionDto[]>('menu/options');
}

/* ============================================================
   Orders
   ============================================================ */

export function createOrder(dto: CreateOrderDto): Promise<any> {
  return apiFetch('orders', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function addOrderItems(
  orderId: number,
  dto: AddOrderItemsDto,
): Promise<any> {
  return apiFetch(`orders/${orderId}/add-items`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function getOrdersBySession(
  sessionToken: string,
): Promise<any[]> {
  return apiFetch<any[]>(`orders/session/${sessionToken}`);
}

export function getOrderDetail(orderId: number): Promise<any> {
  return apiFetch(`orders/${orderId}`);
}

/* ============================================================
   Service Requests
   ============================================================ */

export function createServiceRequest(
  dto: CreateServiceRequestDto,
): Promise<any> {
  return apiFetch('service-requests', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/* ============================================================
   Authenticated Fetch (Customer JWT)
   ============================================================ */

export function apiFetchAuth<T>(
  endpoint: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ============================================================
   Favorites
   ============================================================ */

export function getFavorites(token: string): Promise<any[]> {
  return apiFetchAuth<any[]>('favorites', token);
}

export function getFavoriteIds(token: string): Promise<number[]> {
  return apiFetchAuth<number[]>('favorites/ids', token);
}

export function addFavorite(token: string, productId: number): Promise<any> {
  return apiFetchAuth('favorites', token, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  });
}

export function removeFavorite(token: string, productId: number): Promise<any> {
  return apiFetchAuth(`favorites/${productId}`, token, {
    method: 'DELETE',
  });
}

/* ============================================================
   Order History & Frequent
   ============================================================ */

export function getOrderHistory(token: string): Promise<any[]> {
  return apiFetchAuth<any[]>('orders/customer/history', token);
}

export function getFrequentProducts(token: string): Promise<any[]> {
  return apiFetchAuth<any[]>('orders/customer/frequent', token);
}

/* ============================================================
   Promotions & Coupons
   ============================================================ */

export function validateCoupon(
  code: string,
  storeId: number,
  orderAmount: number,
  customerId?: number,
): Promise<any> {
  return apiFetch('promotions/validate', {
    method: 'POST',
    body: JSON.stringify({
      code,
      store_id: storeId,
      order_amount: orderAmount,
      customer_id: customerId,
    }),
  });
}

export function getActivePromotions(storeId: number): Promise<any[]> {
  return apiFetch<any[]>(`promotions/store/${storeId}/active`);
}

/* ============================================================
   Customer Auth
   ============================================================ */

export function customerRegister(phone: string, name: string): Promise<any> {
  return apiFetch('customer-auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, name }),
  });
}

export function customerLogin(phone: string): Promise<any> {
  return apiFetch('customer-auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getCustomerProfile(token: string): Promise<any> {
  return apiFetchAuth('customer-auth/profile', token);
}
