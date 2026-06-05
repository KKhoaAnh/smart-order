// ============================================================
// Smart Order QR — Shared Enums
// Dùng chung giữa Frontend (Customer, POS) và Backend (API)
// ============================================================

// --- Order ---

export enum OrderStatus {
  PENDING = 'PENDING',       // Chờ thu ngân duyệt
  CONFIRMED = 'CONFIRMED',  // Thu ngân đã xác nhận → Bếp chế biến
  COMPLETED = 'COMPLETED',  // Đã phục vụ xong tất cả món
  CANCELLED = 'CANCELLED',  // Đã hủy đơn
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

export enum ItemStatus {
  PENDING = 'PENDING',   // Chờ chế biến
  COOKING = 'COOKING',   // Đang chế biến
  SERVED = 'SERVED',     // Đã phục vụ
}

// --- Payment ---

export enum PaymentMethod {
  CASH = 'CASH', // Tiền mặt tại quầy (MVP)
  // Các phương thức sau sẽ thêm trong tương lai:
  // VNPAY = 'VNPAY',
  // MOMO = 'MOMO',
  // VIETQR = 'VIETQR',
}

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// --- Table ---

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',     // Bàn trống
  OCCUPIED = 'OCCUPIED',       // Có khách
  CLEANING = 'CLEANING',       // Đang chờ dọn
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

// --- Menu ---

export enum OptionType {
  SUGAR = 'sugar',     // Mức đường
  ICE = 'ice',         // Mức đá
  TOPPING = 'topping', // Topping đính kèm
}

// --- Service Request ---

export enum ServiceRequestType {
  CALL_STAFF = 'CALL_STAFF',       // Gọi nhân viên
  REQUEST_BILL = 'REQUEST_BILL',   // Yêu cầu tính tiền
  OTHER = 'OTHER',                 // Khác
}

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

// --- Notification ---

export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_ITEMS_ADDED = 'ORDER_ITEMS_ADDED',
  SERVICE_REQUEST = 'SERVICE_REQUEST',
  ITEM_STATUS_CHANGED = 'ITEM_STATUS_CHANGED',
}

// --- User Roles ---

export enum RoleName {
  ADMIN = 'Admin',
  CASHIER = 'Cashier',
  KITCHEN = 'Kitchen',
  WAITER = 'Waiter',
}

// --- Store ---

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// --- WebSocket Events ---

export enum SocketEvents {
  // Server → POS
  NEW_ORDER = 'new_order',
  ORDER_ITEMS_ADDED = 'order_items_added',
  SERVICE_REQUEST_CREATED = 'service_request_created',

  // Server → Customer
  ORDER_STATUS_CHANGED = 'order_status_changed',
  ITEM_STATUS_CHANGED = 'item_status_changed',
  PAYMENT_COMPLETED = 'payment_completed',

  // Server → All (Customer in store)
  MENU_UPDATED = 'menu_updated',

  // Client → Server
  JOIN_STORE_ROOM = 'join_store_room',
  JOIN_SESSION_ROOM = 'join_session_room',
  LEAVE_ROOM = 'leave_room',
}
