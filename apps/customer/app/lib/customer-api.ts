import { apiFetch } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ── Customer Auth ── */

function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

async function customerFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getCustomerToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const url = `${API_BASE}/api/${endpoint.replace(/^\//, '')}`;
  const res = await fetch(url, { ...options, headers });
  let body: any;
  try { body = await res.json(); } catch {
    throw new Error('Không thể kết nối máy chủ');
  }
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Lỗi ${res.status}`);
  }
  return body.data;
}

export function registerCustomer(phone: string, name: string) {
  return customerFetch<{ access_token: string; customer: any }>('customer-auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, name }),
  });
}

export function loginCustomer(phone: string) {
  return customerFetch<{ access_token: string; customer: any }>('customer-auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getCustomerProfile() {
  return customerFetch<any>('customer-auth/profile');
}

/* ── Reviews ── */

export interface ReviewData {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  customer: { id: number; name: string; avatar_url?: string };
}

export interface ReviewSummary {
  avg_rating: number;
  total_count: number;
  distribution: Record<number, number>;
}

export interface ReviewsPage {
  data: ReviewData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getProductReviews(productId: number, page = 1, limit = 10): Promise<ReviewsPage> {
  return apiFetch<ReviewsPage>(`reviews/product/${productId}?page=${page}&limit=${limit}`);
}

export function getReviewSummary(productId: number): Promise<ReviewSummary> {
  return apiFetch<ReviewSummary>(`reviews/product/${productId}/summary`);
}

export function createReview(data: { product_id: number; rating: number; comment?: string; order_id?: number }) {
  return customerFetch<ReviewData>('reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteReview(reviewId: number) {
  return customerFetch<void>(`reviews/${reviewId}`, { method: 'DELETE' });
}
