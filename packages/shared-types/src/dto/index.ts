// ============================================================
// Smart Order QR — Shared DTOs (Data Transfer Objects)
// Dùng cho API request/response giữa FE ↔ BE
// ============================================================

import { PaymentMethod } from '../enums';

// --- Session ---

export interface InitSessionDto {
  qr_token: string;
  device_fingerprint?: string;
}

export interface InitSessionResponseDto {
  session_token: string;
  store: {
    id: number;
    name: string;
    logo_url?: string;
    address: string;
    phone: string;
  };
  table: {
    id: number;
    table_number: string;
    area?: string;
  };
}

// --- Order ---

export interface CreateOrderItemDto {
  product_id: number;
  variant_id?: number;
  quantity: number;
  note?: string;
  option_ids?: number[];
}

export interface CreateOrderDto {
  session_token: string;
  items: CreateOrderItemDto[];
  customer_id?: number;
}


export interface AddOrderItemsDto {
  session_token: string;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderStatusDto {
  status: string;
  reject_reason?: string;
}

export interface UpdateItemStatusDto {
  item_status: string;
}

// --- Payment ---

export interface CreatePaymentDto {
  order_id: number;
  payment_method: PaymentMethod;
  amount: number;
}

// --- Menu (response) ---

export interface MenuCategoryDto {
  id: number;
  name: string;
  priority: number;
  products: MenuProductDto[];
}

export interface MenuProductDto {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_popular: boolean;
  avg_rating?: number;
  review_count?: number;
  preparation_time?: number;
  variants: MenuVariantDto[];
  options: MenuOptionDto[];
}

export interface MenuVariantDto {
  id: number;
  variant_name: string;
  price_adjustment: number;
  is_default: boolean;
}

export interface MenuOptionDto {
  id: number;
  option_name: string;
  option_type: string;
  price: number;
}

// --- Customer Auth ---

export interface CustomerDto {
  id: number;
  phone: string;
  name: string;
  avatar_url?: string;
}

// --- Reviews ---

export interface ReviewDto {
  id: number;
  customer_id: number;
  product_id: number;
  order_id?: number;
  rating: number;
  comment?: string;
  is_visible: boolean;
  created_at: string;
  customer?: CustomerDto;
  product?: { id: number; name: string };
}

export interface ReviewSummaryDto {
  avg_rating: number;
  total_count: number;
  distribution: Record<number, number>;
}

export interface CreateReviewDto {
  product_id: number;
  rating: number;
  comment?: string;
  order_id?: number;
}

// --- Service Request ---

export interface CreateServiceRequestDto {
  session_token: string;
  request_type: string;
  message?: string;
}
