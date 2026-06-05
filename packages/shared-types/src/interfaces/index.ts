// ============================================================
// Smart Order QR — Shared Interfaces
// Các interface mô tả shape của entities trong hệ thống
// ============================================================

import {
  OrderStatus,
  PaymentStatus,
  ItemStatus,
  PaymentMethod,
  PaymentTransactionStatus,
  TableStatus,
  SessionStatus,
  OptionType,
  ServiceRequestType,
  ServiceRequestStatus,
  NotificationType,
  StoreStatus,
} from '../enums';

// --- Store ---

export interface IStore {
  id: number;
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  opening_hours?: string;
  status: StoreStatus;
  created_at: Date;
  updated_at: Date;
}

// --- Table ---

export interface ITable {
  id: number;
  store_id: number;
  table_number: string;
  qr_code_token: string;
  capacity?: number;
  area?: string;
  status: TableStatus;
  created_at: Date;
}

export interface ITableSession {
  id: number;
  table_id: number;
  session_token: string;
  device_fingerprint?: string;
  ip_address?: string;
  status: SessionStatus;
  opened_at: Date;
  closed_at?: Date;
}

// --- Menu ---

export interface ICategory {
  id: number;
  store_id: number;
  name: string;
  priority: number;
  is_active: boolean;
  created_at: Date;
}

export interface IProduct {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_popular: boolean;
  preparation_time?: number;
  created_at: Date;
}

export interface IProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  price_adjustment: number;
  is_default: boolean;
}

export interface IOption {
  id: number;
  option_name: string;
  option_type: OptionType;
  price: number;
}

export interface IProductOption {
  product_id: number;
  option_id: number;
}

// --- Order ---

export interface IOrder {
  id: number;
  store_id: number;
  table_id: number;
  session_id: number;
  order_number: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  price: number;
  subtotal: number;
  note?: string;
  order_round: number;
  item_status: ItemStatus;
}

export interface IOrderItemOption {
  id: number;
  order_item_id: number;
  option_id: number;
  price: number;
}

// --- Payment ---

export interface IPayment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentTransactionStatus;
  paid_at?: Date;
}

// --- Service Request ---

export interface IServiceRequest {
  id: number;
  table_id: number;
  session_id: number;
  request_type: ServiceRequestType;
  message?: string;
  status: ServiceRequestStatus;
  created_at: Date;
  resolved_at?: Date;
}

// --- Notification ---

export interface INotification {
  id: number;
  store_id: number;
  type: NotificationType;
  reference_id: number;
  is_read: boolean;
  created_at: Date;
}

// --- User ---

export interface IUser {
  id: number;
  store_id: number;
  username: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
}

export interface IRole {
  id: number;
  role_name: string;
}

export interface IUserRole {
  user_id: number;
  role_id: number;
}
