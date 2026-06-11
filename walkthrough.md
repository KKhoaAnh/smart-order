# 📋 Smart Order QR — Walkthrough Toàn Diện

> **Cập nhật lần cuối**: 2026-06-05  
> **Trạng thái**: Phase 0 ✅ | Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅ | Phase 5–6 ⬜  
> **Mục tiêu**: Hệ thống đặt món thông minh cho quán cà phê & nhà hàng qua QR code.  
> **Luồng chính**: Khách quét QR → Xem menu → Đặt món → Bếp chế biến → Phục vụ → Thanh toán tại quầy.

---

## 1. Kiến trúc Tổng thể

### 1.1 Monorepo Structure

```
d:\smart-order/
├── apps/
│   ├── api/            ← NestJS 11 (REST API + WebSocket, port 3001)
│   ├── customer/       ← Next.js 15 + TailwindCSS (Customer App, port 3000)
│   └── pos/            ← Next.js 15 + TailwindCSS (POS/Admin, port 3002)
├── packages/
│   └── shared-types/   ← Enums, Interfaces, DTOs dùng chung FE ↔ BE
├── docker-compose.yml  ← PostgreSQL 16 + Redis 7 + pgAdmin 4
├── turbo.json          ← Turborepo build orchestration
├── tsconfig.base.json  ← Shared TypeScript config (ES2022, strict)
├── .env                ← Environment variables
└── package.json        ← Root workspace config (npm workspaces)
```

### 1.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend API | NestJS | 11.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 (Docker) |
| Cache | Redis | 7 (Docker) |
| Auth | JWT (Passport) | — |
| WebSocket | Socket.IO | 4.8.x |
| Frontend | Next.js + React | 15.x |
| Styling | TailwindCSS | 4.x |
| Build Tool | Turborepo | 2.9.x |
| Language | TypeScript | 5.9.x |

### 1.3 Docker Services

| Service | Image | Port | Credentials |
|---------|-------|------|-------------|
| PostgreSQL | `postgres:16-alpine` | `5432` | `smart_order_user / smart_order_pass_2026` / DB: `smart_order_db` |
| Redis | `redis:7-alpine` | `6379` | — |
| pgAdmin | `dpage/pgadmin4` | `5050` | `admin@gmail.com / admin123` |

### 1.4 Environment Variables (`.env`)

```env
DB_HOST=localhost / DB_PORT=5432 / DB_USERNAME=smart_order_user / DB_PASSWORD=smart_order_pass_2026 / DB_DATABASE=smart_order_db
REDIS_HOST=localhost / REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production / JWT_EXPIRES_IN=1d
API_PORT=3001 / API_PREFIX=api
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3001 / NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

---

## 2. Phase 0: Monorepo & Hạ tầng ✅

**Hoàn thành**: Khởi tạo toàn bộ cấu trúc monorepo.

| Item | Chi tiết |
|------|----------|
| Root config | `package.json` (npm workspaces), `turbo.json`, `tsconfig.base.json`, `.prettierrc`, `.gitignore` |
| apps/api | NestJS 11 + TypeORM + ConfigModule + exception filter + interceptor |
| apps/customer | Next.js 15 + TailwindCSS 4 + App Router (port 3000) |
| apps/pos | Next.js 15 + TailwindCSS 4 + App Router (port 3002) |
| packages/shared-types | Enums, Interfaces, DTOs dùng chung |
| Docker | PostgreSQL 16 + Redis 7 + pgAdmin 4 |
| Verify | `npm install` (973 packages), `turbo build` thành công |

---

## 3. Phase 1: Database & Backend Core ✅

### 3.1 Cấu trúc API

```
apps/api/src/
├── main.ts                    ← Entry: CORS, ValidationPipe, GlobalPrefix "/api"
├── app.module.ts              ← Wire 9 modules + Global Filter + Interceptor
├── config/
│   └── data-source.ts         ← TypeORM DataSource (cho migrations CLI)
├── common/
│   ├── filters/http-exception.filter.ts  ← Response: { success, statusCode, message, errors }
│   └── interceptors/transform.interceptor.ts  ← Response: { success, data, timestamp }
├── database/
│   ├── entities/     (16 files + index.ts barrel)
│   ├── migrations/   (1717000000000-InitialSchema.ts)
│   └── seeds/run-seed.ts
└── modules/
    ├── auth/              ├── store/             ├── tables/
    ├── sessions/          ├── menu/              ├── orders/
    ├── service-requests/  ├── notifications/     └── websocket/  ← Phase 2
```

### 3.2 Database Entities (16 bảng)

| Entity | Bảng | Mô tả | File |
|--------|------|-------|------|
| Store | `stores` | Thông tin quán (1 quán) | [store.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/store.entity.ts) |
| Table | `tables` | Bàn + `qr_code_token` unique | [table.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/table.entity.ts) |
| TableSession | `table_sessions` | Phiên khách (ACTIVE/EXPIRED) | [table-session.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/table-session.entity.ts) |
| Category | `categories` | Danh mục: Cà phê, Trà... | [category.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/category.entity.ts) |
| Product | `products` | Sản phẩm + giá + thời gian chế biến | [product.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/product.entity.ts) |
| ProductVariant | `product_variants` | Size S/M/L + `price_adjustment` | [product-variant.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/product-variant.entity.ts) |
| Option | `options` | Đường/Đá/Topping + giá | [option.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/option.entity.ts) |
| Order | `orders` | Đơn hàng: status, payment_status | [order.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/order.entity.ts) |
| OrderItem | `order_items` | Món: quantity, price, `order_round` | [order-item.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/order-item.entity.ts) |
| OrderItemOption | `order_item_options` | Option đã chọn cho item | [order-item-option.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/order-item-option.entity.ts) |
| Payment | `payments` | Thanh toán: CASH, amount, paid_at | [payment.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/payment.entity.ts) |
| User | `users` | Nhân viên: username, password_hash | [user.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/user.entity.ts) |
| Role | `roles` | Admin, Cashier, Kitchen, Waiter | [role.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/role.entity.ts) |
| ServiceRequest | `service_requests` | Gọi nhân viên / Tính tiền | [service-request.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/service-request.entity.ts) |
| Notification | `notifications` | Thông báo POS | [notification.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/notification.entity.ts) |
| ActivityLog | `activity_logs` | Nhật ký hoạt động | [activity-log.entity.ts](file:///d:/smart-order/apps/api/src/database/entities/activity-log.entity.ts) |

> **Join tables**: `user_roles` (User ↔ Role ManyToMany), `product_options` (Product ↔ Option ManyToMany)

### 3.3 Seed Data

File: [run-seed.ts](file:///d:/smart-order/apps/api/src/database/seeds/run-seed.ts)

| Loại | Số lượng | Chi tiết |
|------|----------|----------|
| Store | 1 | Coffee House Demo — 123 Nguyễn Huệ, Q1, TP.HCM |
| Tables | 10 | Trong nhà (5), Ngoài trời (3), VIP (2) |
| Roles | 4 | Admin, Cashier, Kitchen, Waiter |
| Users | 3 | `admin/admin123`, `kitchen/kitchen123`, `cashier/cashier123` |
| Categories | 5 | Cà phê, Trà, Freeze, Bánh & Snack, Nước ép & Sinh tố |
| Products | 20 | Phân bổ trong 5 danh mục |
| Variants | 38 | Size M/L cho từng sản phẩm |
| Options | 14 | Mức đường (4), Mức đá (4), Topping (6) |

### 3.4 API Modules & Endpoints (~35 endpoints)

| Module | Base Path | Key Endpoints | Auth | File |
|--------|-----------|---------------|------|------|
| **Auth** | `/api/auth` | `POST /login`, `GET /profile` | JWT | [auth.module.ts](file:///d:/smart-order/apps/api/src/modules/auth/auth.module.ts) |
| **Store** | `/api/store` | `GET /`, `PATCH /` | Public/Admin | [store.module.ts](file:///d:/smart-order/apps/api/src/modules/store/store.module.ts) |
| **Tables** | `/api/tables` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`, `PATCH /:id/regenerate-qr`, `PATCH /:id/status` | JWT (Admin/Cashier) | [tables.controller.ts](file:///d:/smart-order/apps/api/src/modules/tables/tables.controller.ts) |
| **Sessions** | `/api/sessions` | `POST /init` | Public | [sessions.controller.ts](file:///d:/smart-order/apps/api/src/modules/sessions/sessions.controller.ts) |
| **Menu** | `/api/menu` | `GET /store/:storeId`, CRUD categories & products | Public/Admin | [menu.module.ts](file:///d:/smart-order/apps/api/src/modules/menu/menu.module.ts) |
| **Orders** | `/api/orders` | `POST /`, `POST /:id/add-items`, `GET /session/:token`, `GET /:id`, `GET /store/:storeId`, `PATCH /:id/status`, `PATCH /items/:itemId/status`, `POST /:id/pay` | Mixed | [orders.controller.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.controller.ts) |
| **ServiceRequests** | `/api/service-requests` | `POST /`, `GET /store/:storeId`, `PATCH /:id/acknowledge`, `PATCH /:id/resolve` | Mixed | [service-requests.controller.ts](file:///d:/smart-order/apps/api/src/modules/service-requests/service-requests.controller.ts) |
| **Notifications** | `/api/notifications` | `GET /`, `GET /count`, `PATCH /:id/read`, `PATCH /read-all` | JWT (POS) | [notifications.module.ts](file:///d:/smart-order/apps/api/src/modules/notifications/notifications.module.ts) |

> **Lưu ý routes quan trọng**:
> - `GET /api/tables` — lấy store_id từ JWT, **KHÔNG** dùng `/tables/store/:id`
> - `POST /api/orders` — Customer gửi `session_token` trong body, không cần JWT
> - `PATCH /api/orders/items/:itemId/status` — Kitchen cập nhật trạng thái món

### 3.5 Global Configurations

- **ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **GlobalExceptionFilter**: Error → `{ success: false, statusCode, message, errors, timestamp, path }`
- **TransformInterceptor**: Success → `{ success: true, data, timestamp }`
- **CORS**: cho phép `localhost:3000` (Customer) và `localhost:3002` (POS)

---

## 4. Phase 2: WebSocket Real-time ✅

### 4.1 WebSocket Gateway

File: [order.gateway.ts](file:///d:/smart-order/apps/api/src/modules/websocket/order.gateway.ts) | [websocket.module.ts](file:///d:/smart-order/apps/api/src/modules/websocket/websocket.module.ts)

- **`@Global()` module** — tất cả feature modules inject được `OrderGateway` mà không cần import riêng
- **Socket.IO** với CORS support, transports: `['websocket', 'polling']`
- **Track connected clients** qua `Map<clientId, { rooms, type }>`

### 4.2 Room Management

| Room Pattern | Ai join? | Mục đích |
|-------------|----------|----------|
| `store:{storeId}` | POS/Cashier/Kitchen/Waiter | Nhận mọi events của store |
| `store:{storeId}:kitchen` | Kitchen | Reserved cho Kitchen-only events |
| `session:{sessionToken}` | Customer | Nhận updates riêng cho phiên |

**Client → Server messages**:
- `join_store_room` → `{ store_id: number, role?: string }` — POS join
- `join_session_room` → `{ session_token: string }` — Customer join
- `leave_room` → `{ room: string }` — Rời room

### 4.3 Server → Client Events

| Event | Khi nào? | Gửi cho ai? | Tích hợp tại |
|-------|----------|-------------|-------------|
| `new_order` | Khách tạo đơn mới | `store:{storeId}` (POS) | [orders.service.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.service.ts) `createOrder()` |
| `order_items_added` | Khách gọi thêm món | `store:{storeId}` (POS) | [orders.service.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.service.ts) `addItems()` |
| `order_status_changed` | POS đổi trạng thái đơn | `session:{token}` (Customer) | [orders.service.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.service.ts) `updateOrderStatus()` |
| `item_status_changed` | Bếp đổi trạng thái món | `session:{token}` + `store:{storeId}` | [orders.service.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.service.ts) `updateItemStatus()` |
| `payment_completed` | Thanh toán xong | `session:{token}` (Customer) | [orders.service.ts](file:///d:/smart-order/apps/api/src/modules/orders/orders.service.ts) `processPayment()` |
| `service_request_created` | Khách gọi nhân viên | `store:{storeId}` (POS) | [service-requests.service.ts](file:///d:/smart-order/apps/api/src/modules/service-requests/service-requests.service.ts) `create()` |
| `menu_updated` | Admin cập nhật menu | `store:{storeId}` (All) | `emitMenuUpdated()` (sẵn sàng, chưa hook) |

**Event payload format**:
```json
{
  "type": "NEW_ORDER",
  "data": { /* order/item/request detail */ },
  "timestamp": "2026-06-02T09:41:57.000Z"
}
```

### 4.4 Bugs Đã Fix Trong Phase 2

| Bug | Nguyên nhân | Fix |
|-----|-------------|-----|
| `nest build` tạo dist rỗng | `deleteOutDir: true` xóa dist trước khi tsc kịp output trong monorepo | Đổi build script sang `tsc -p tsconfig.json` |
| `getOrderDetail()` trả 404 khi tạo order | Gọi bên trong transaction nhưng dùng repo ngoài transaction context → data chưa commit | Di chuyển `getOrderDetail()` ra **sau** `transaction()` |
| Test sai route `/tables/store/1` | `TablesController` dùng `GET /` + JWT để lấy store_id | Sửa test thành `GET /api/tables` với JWT header |

---

## 5. Shared Types (`packages/shared-types`)

### 5.1 Enums (14 enums)
`OrderStatus`, `PaymentStatus`, `ItemStatus`, `PaymentMethod`, `PaymentTransactionStatus`, `TableStatus`, `SessionStatus`, `OptionType`, `ServiceRequestType`, `ServiceRequestStatus`, `NotificationType`, `RoleName`, `StoreStatus`, `SocketEvents`

### 5.2 Interfaces (15 interfaces)
`IStore`, `ITable`, `ITableSession`, `ICategory`, `IProduct`, `IProductVariant`, `IOption`, `IProductOption`, `IOrder`, `IOrderItem`, `IOrderItemOption`, `IPayment`, `IServiceRequest`, `INotification`, `IUser`, `IRole`, `IUserRole`

### 5.3 DTOs (11 DTOs)
`InitSessionDto`, `InitSessionResponseDto`, `CreateOrderItemDto`, `CreateOrderDto`, `AddOrderItemsDto`, `UpdateOrderStatusDto`, `UpdateItemStatusDto`, `CreatePaymentDto`, `MenuCategoryDto`, `MenuProductDto`, `CreateServiceRequestDto`

---

## 6. Build & Run Commands

```bash
# 1. Khởi động Docker (PostgreSQL + Redis + pgAdmin)
docker-compose up -d

# 2. Install dependencies (từ root)
npm install

# 3. Seed database (lần đầu hoặc reset data)
npm run seed --workspace=api

# 4. Build API
cd apps/api
npx tsc -p tsconfig.json        # ⚠️ Dùng tsc trực tiếp, KHÔNG dùng nest build

# 5. Start API server
node dist/main.js                # → http://localhost:3001/api
# Hoặc:
npm run dev --workspace=api      # Build + start

# 6. Chạy integration tests
node apps/api/test-backend.js    # 53 tests

# 7. Turbo build toàn monorepo
npx turbo build --force
```

> **⚠️ Lưu ý build**: Dùng `tsc -p tsconfig.json` thay cho `nest build`. Nếu gặp incremental cache issue, xóa `tsconfig.tsbuildinfo` trước khi build.

---

## 7. Kết Quả Kiểm Thử (53/53 PASS ✅)

File test: [test-backend.js](file:///d:/smart-order/apps/api/test-backend.js)

| Group | Module | Tests | Status |
|-------|--------|-------|--------|
| 1 | Server Health | 2 | ✅ |
| 2 | Auth (login, JWT, profile, reject) | 7 | ✅ |
| 3 | Store (info, name, status) | 3 | ✅ |
| 4 | Menu (5 categories, 20 products, variants, options) | 5 | ✅ |
| 5 | Tables (10 bàn, QR token, status) | 5 | ✅ |
| 6 | Sessions (init, validate, reject invalid QR) | 5 | ✅ |
| 7 | Orders — Tạo đơn (number, status, items, total) | 6 | ✅ |
| 8 | Orders — Trạng thái (CONFIRMED, detail) | 3 | ✅ |
| 9 | Kitchen workflow (COOKING → SERVED → auto COMPLETED) | 4 | ✅ |
| 10 | Service Requests (create → acknowledge → resolve) | 4 | ✅ |
| 11 | Notifications (list, count) | 2 | ✅ |
| 12 | Payment (pay, PAID status, COMPLETED status) | 3 | ✅ |
| 13 | Gọi thêm món (add-items, round 2, total tăng) | 4 | ✅ |

---

## 8. Phase 3: Customer Web App (Frontend) ✅

### 8.1 Tổng quan

Giao diện đặt món qua QR dành cho khách hàng. Xây dựng trên **Next.js 15** + **TailwindCSS 4** + **Zustand** + **Framer Motion**.

- **Tone màu**: Sáng, trắng, nâu cà phê (#6F4E37), xám — premium, tối giản
- **Typography**: Playfair Display (headings) + Inter (body)
- **Responsive**: Mobile-first, tối ưu cho điện thoại
- **Animation**: Framer Motion — spring, drag-to-dismiss, staggered lists

### 8.2 Luồng Hoạt Động Chính

```
📱 Quét QR → Landing Page (init session) → Menu (browse/search/filter)
→ Product Detail (size/topping/notes) → Cart (review/quantity)
→ Submit Order → Tracking (real-time timeline) → Thank You
```

### 8.3 Cấu trúc File

```
apps/customer/app/
├── globals.css                    # Design system (TailwindCSS 4 theme)
├── layout.tsx                     # Root layout (fonts, toaster)
├── page.tsx                       # Root fallback (no QR)
├── lib/
│   ├── api.ts                     # API client (fetch wrapper + endpoints)
│   ├── socket.ts                  # Socket.IO client (singleton)
│   └── format.ts                  # Price, time, date formatters
├── store/
│   ├── session-store.ts           # Session/store/table info (Zustand)
│   ├── cart-store.ts              # Cart with localStorage persist
│   └── order-store.ts             # Current order tracking
├── hooks/
│   ├── useMenu.ts                 # Menu fetch + search/filter
│   ├── useOrder.ts                # Order submission + fetch
│   ├── useSocket.ts               # WebSocket auto-connect + listeners
│   └── useServiceRequest.ts       # Call staff / request bill
├── components/
│   ├── ui/
│   │   ├── Button.tsx             # Primary/secondary/ghost/danger
│   │   ├── Badge.tsx              # Status badges
│   │   ├── BottomSheet.tsx        # Drag-to-dismiss sheet
│   │   ├── QuantitySelector.tsx   # +/- controls
│   │   └── Skeleton.tsx           # Shimmer loading
│   └── states/
│       ├── EmptyCart.tsx           # Giỏ hàng trống
│       ├── SessionExpired.tsx     # Phiên hết hạn
│       ├── NetworkError.tsx       # Lỗi kết nối
│       └── InvalidQR.tsx          # QR không hợp lệ
└── (order)/[storeSlug]/
    ├── layout.tsx                 # WebSocket initialization
    ├── page.tsx                   # Landing page (QR → session init)
    ├── menu/
    │   ├── page.tsx               # Menu browser
    │   └── components/
    │       ├── SearchBar.tsx       # Search với focus animation
    │       ├── CategoryTabs.tsx    # Horizontal scroll tabs
    │       ├── ProductCard.tsx     # Card sản phẩm
    │       ├── ProductDetailSheet.tsx  # Bottom sheet chi tiết sản phẩm
    │       └── FloatingCartButton.tsx  # Nút giỏ hàng nổi
    ├── cart/
    │   ├── page.tsx               # Cart review + submit
    │   └── components/
    │       └── CartItem.tsx        # Item trong giỏ hàng
    └── tracking/
        ├── page.tsx               # Order tracking
        └── components/
            ├── OrderTimeline.tsx   # Timeline trạng thái đơn
            ├── OrderItemsList.tsx  # Danh sách món theo lượt
            └── ServiceRequestPopup.tsx  # Popup gọi nhân viên
```

### 8.4 Chi Tiết Từng Trang

#### Landing Page (`/[storeSlug]?table=xxx`)

| Feature | Chi tiết |
|---------|----------|
| Session Init | Gọi `POST /api/sessions/init` với QR token |
| UI | Logo animated (spring), tên quán, địa chỉ, card bàn, nút CTA gradient |
| Error States | InvalidQR (QR sai), Loading spinner (đang kết nối) |
| File | [page.tsx](file:///d:/smart-order/apps/customer/app/(order)/[storeSlug]/page.tsx) |

#### Menu Page (`/[storeSlug]/menu`)

| Feature | Chi tiết |
|---------|----------|
| Sticky Header | Back button, tên quán, số bàn |
| Search | Real-time filter tên + mô tả sản phẩm |
| Category Tabs | Scroll ngang, auto-scroll tab active, click → scroll tới section |
| Product Cards | Ảnh 88x88, tên, mô tả, giá, badge Hot 🔥, overlay "Hết hàng", cart quantity badge |
| Product Detail | Bottom sheet drag-to-dismiss, chọn size/đường/đá/topping, ghi chú, quantity ±, "Thêm — 45.000đ" |
| Floating Cart | Fixed bottom, item count badge, tổng tiền, spring animation |
| File | [page.tsx](file:///d:/smart-order/apps/customer/app/(order)/[storeSlug]/menu/page.tsx) |

#### Cart Page (`/[storeSlug]/cart`)

| Feature | Chi tiết |
|---------|----------|
| Cart Items | Ảnh, tên, variant/options tags, quantity ±, subtotal, nút xoá |
| Add More | Nút "Thêm món khác" (dashed border) → quay về Menu |
| Submit | "Đặt món" (đơn mới) hoặc "Gọi thêm món" (đơn đang xử lý) |
| Bottom Bar | Tổng cộng + nút submit full-width gradient |
| File | [page.tsx](file:///d:/smart-order/apps/customer/app/(order)/[storeSlug]/cart/page.tsx) |

#### Tracking Page (`/[storeSlug]/tracking`)

| Feature | Chi tiết |
|---------|----------|
| Order Timeline | 4 bước: Chờ xác nhận → Đã xác nhận → Đang chế biến → Hoàn thành |
| Timeline UI | Color-coded dots, pulsing active step, connecting lines |
| Order Items | Grouped by `order_round` (Lượt 1, Gọi thêm Lượt 2...) |
| Item Badges | Per-item status: Chờ chế biến (amber), Đang chế biến (blue), Đã phục vụ (green) |
| Service Request | Bottom sheet: Gọi nhân viên 🔔 / Tính tiền 💳 / Yêu cầu khác 📝 |
| Thank You | Hiện khi `payment_status = PAID`: icon Heart, "Cảm ơn quý khách!", tổng tiền |
| Bottom Actions | "Hỗ trợ" (outline) + "Gọi thêm món" (filled gradient) |
| File | [page.tsx](file:///d:/smart-order/apps/customer/app/(order)/[storeSlug]/tracking/page.tsx) |

### 8.5 State Management (Zustand)

| Store | Key State | Persist | File |
|-------|-----------|---------|------|
| **SessionStore** | sessionToken, storeInfo, tableInfo, isInitialized | No | [session-store.ts](file:///d:/smart-order/apps/customer/app/store/session-store.ts) |
| **CartStore** | items[], getTotalItems(), getTotalAmount() | localStorage | [cart-store.ts](file:///d:/smart-order/apps/customer/app/store/cart-store.ts) |
| **OrderStore** | currentOrder, updateOrderStatus(), updateItemStatus() | No | [order-store.ts](file:///d:/smart-order/apps/customer/app/store/order-store.ts) |

**Cart Item ID Logic**: `${productId}-${variantId}-${sortedOptionIds}` — cùng combo thì tăng quantity thay vì tạo dòng mới.

### 8.6 Real-time (WebSocket)

Hook [useSocket](file:///d:/smart-order/apps/customer/app/hooks/useSocket.ts) tự động:
1. Connect khi có `sessionToken`
2. Join room `session:{token}`
3. Lắng nghe 4 events:

| Event | Hành động | Toast |
|-------|-----------|-------|
| `order_status_changed` | Update timeline | ✅ Đã xác nhận / ❌ Đã hủy / 🍽️ Hoàn thành |
| `item_status_changed` | Update per-item badge | 👨‍🍳 Đang chế biến / 🍽️ Đã phục vụ |
| `payment_completed` | Show Thank You screen | 💰 Thanh toán hoàn tất |
| `menu_updated` | Toast notification | 📋 Menu đã cập nhật |

### 8.7 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `brand-primary` | `#6F4E37` | Buttons, active states, price |
| `brand-secondary` | `#A0785D` | Accents, focus borders |
| `brand-light` | `#D4B896` | Disabled, placeholders |
| `bg-primary` | `#FAFAF8` | Page background |
| `bg-secondary` | `#F5F0EB` | Cards hover, search bg |
| `border` | `#E8E0D8` | Card borders |
| `text-primary` | `#1A1A1A` | Headings, main text |
| `text-secondary` | `#6B6B6B` | Descriptions, sublabels |

### 8.8 Build Result

```
✓ Compiled successfully (0 errors, warnings only)
✓ Linting and type checking passed
✓ Generating static pages (4/4)

Route                                       Size  First Load JS
┌ ○ /                                    1.27 kB         143 kB
├ ƒ /[storeSlug]                         3.52 kB         145 kB
├ ƒ /[storeSlug]/cart                    5.36 kB         156 kB
├ ƒ /[storeSlug]/menu                     8.9 kB         162 kB
└ ƒ /[storeSlug]/tracking                9.06 kB         162 kB
```

### 8.9 Dependencies Mới (Phase 3)

| Package | Version | Mục đích |
|---------|---------|----------|
| `zustand` | ^5.x | State management (lightweight, persist middleware) |
| `socket.io-client` | ^4.8.x | WebSocket client cho real-time updates |
| `framer-motion` | ^12.x | Animations (spring, drag, AnimatePresence) |
| `lucide-react` | ^0.4x | Icon library (Coffee, ShoppingBag, Bell...) |
| `react-hot-toast` | ^2.x | Toast notifications (positioned bottom-center) |

---

## 9. Phase 4: POS / Admin Panel (Frontend) ✅

### 9.1 Tổng quan
Phase 4 xây dựng hoàn chỉnh giao diện quản lý **POS / Admin Panel** (Next.js, port 3002) dành cho nhân viên quán. Hệ thống sử dụng TailwindCSS 4 (CSS-based custom theme), Zustand để lưu trữ state, và Socket.IO client để đồng bộ dữ liệu thời gian thực. Giao diện được thiết kế tối giản, chuyên nghiệp và có tính ứng dụng cao.

### 9.2 Cấu trúc Thư mục POS App (`apps/pos/app/`)
```
apps/pos/app/
├── globals.css                    # Design system tokens (TailwindCSS 4)
├── layout.tsx                     # Root Layout (Inter & Playfair Display, Toaster)
├── page.tsx                       # Root Redirect to /dashboard/orders
├── lib/
│   ├── api.ts                     # API Client (38 functions + JWT interceptor)
│   ├── socket.ts                  # Socket.IO client singleton & rooms
│   ├── format.ts                  # Tiền tệ, phần trăm, ngày giờ Việt Nam
│   └── utils.ts                   # Tailwind merge cn(), getInitials(), role helpers
├── stores/
│   ├── authStore.ts               # Zustand lưu token, user và persist localStorage
│   ├── orderStore.ts              # Zustand quản lý danh sách đơn hàng
│   ├── notificationStore.ts       # Zustand quản lý thông báo realtime
│   └── uiStore.ts                 # Trạng thái đóng/mở sidebar, modal
├── hooks/
│   ├── useAuth.ts                 # Auth business logic (login, logout, checks)
│   ├── useOrders.ts               # Orders business logic (confirm, reject, pay)
│   ├── useSocket.ts               # Lắng nghe sự kiện WebSocket realtime + âm thanh
│   ├── useMenu.ts                 # CRUD thực đơn (Category, Product, Availability)
│   └── useTables.ts               # CRUD bàn ăn, QR code, lọc khu vực
├── components/
│   ├── ui/                        # 14 UI components dùng chung (Button, Badge, Modal, v.v.)
│   └── layout/                    # Layout components (Sidebar, Header, DashboardLayout)
├── (auth)/
│   └── login/                     # Trang đăng nhập premium
└── dashboard/                     # Các route trong dashboard (bảo vệ bởi Auth Guard)
    ├── layout.tsx                 # Dashboard Wrapper + Auth Guard + Socket Room Join
    ├── page.tsx                   # Redirect -> /dashboard/orders
    ├── orders/                    # Quản lý đơn hàng (Kanban, chi tiết đơn)
    ├── kitchen/                   # Màn hình bếp KDS (Cooking/Served ticket workflow)
    ├── menu/                      # Quản lý danh mục & món ăn (Availability switch, CRUD modals)
    ├── tables/                    # Quản lý bàn ăn (status-colored, QR modal, CRUD)
    ├── reports/                   # Báo cáo doanh thu & sản phẩm bán chạy (Recharts)
    ├── users/                     # Quản lý tài khoản nhân viên
    └── settings/                  # Cài đặt cửa hàng
```

### 9.3 Chi Tiết Từng Phân Hệ Dashboard

#### 1. 🔐 Xác thực & Đăng nhập (`/login`)
- Giao diện đăng nhập cao cấp, căn giữa, logo Coffee, hỗ trợ ẩn/hiện mật khẩu, thông báo lỗi bằng Toast chi tiết.
- Tự động chuyển hướng về `/dashboard/orders` nếu đã có session token hợp lệ (lưu ở `localStorage`).

#### 2. 📋 Màn hình Quản lý đơn hàng (`/dashboard/orders`)
- **Bộ lọc Trạng thái**: Phân loại Tất cả, Chờ xử lý, Đã xác nhận, Hoàn thành. Mỗi tab hiển thị số lượng đơn real-time.
- **Tìm kiếm**: Tìm nhanh theo số hóa đơn hoặc số bàn ăn.
- **Detail Panel**: Slide-over panel hiển thị danh sách chi tiết từng món trong đơn (bao gồm ghi chú, variant, topping), tổng tiền, trạng thái thanh toán.
- **Hành động xử lý**: Cashier có thể Xác nhận đơn, Từ chối đơn (yêu cầu lý do và lưu lại), và Thanh toán (thanh toán tiền mặt tại quầy).

#### 3. 👨‍🍳 Màn hình Bếp (Kitchen Display System - `/dashboard/kitchen`)
- Chỉ hiển thị các đơn hàng ở trạng thái `CONFIRMED`.
- Vé bếp (Kitchen Tickets) hiển thị chi tiết món ăn và được sắp xếp từ cũ nhất đến mới nhất để tránh trễ đơn.
- Badge thời gian chờ tự động đổi màu theo mức độ cảnh báo (Xanh < 5 phút, Vàng 5 - 10 phút, Đỏ > 10 phút).
- Nhân viên bếp có thể cập nhật trạng thái chi tiết cho từng món: `PENDING` → `COOKING` → `SERVED`.

#### 4. 🍽️ Quản lý Thực đơn (`/dashboard/menu`)
- Giao diện chia đôi: Bên trái là danh sách Danh mục, bên phải hiển thị Lưới sản phẩm.
- Hỗ trợ bật/tắt trạng thái kinh doanh nhanh chóng của món qua Switch.
- Modal CRUD: Tạo mới/Sửa thông tin Danh mục và Sản phẩm (tên, mô tả, giá bán, ảnh, danh mục).

#### 5. 🪑 Quản lý Bàn & QR (`/dashboard/tables`)
- Hiển thị danh sách bàn theo lưới, phân loại màu theo trạng thái (Xanh = Trống, Đỏ = Có khách, Vàng = Đã đặt, Xanh dương = Chờ dọn).
- Tabs lọc động theo Khu vực (Area) được lấy từ dữ liệu bàn ăn.
- Modal QR Code: Tích hợp `qrcode.react` xuất mã QR động cho từng bàn, cho phép tải ảnh QR về hoặc in ấn.
- Modal CRUD: Thêm mới, Sửa khu vực/số thứ tự bàn, Xóa bàn.

#### 6. 📊 Báo cáo & Thống kê (`/dashboard/reports`)
- 4 thẻ thống kê: Tổng doanh thu, Số lượng đơn hàng, Giá trị trung bình đơn, Tỷ lệ hoàn thành đơn.
- Biểu đồ cột `Recharts` trực quan hóa doanh thu theo thời gian lọc (Hôm nay, 7 ngày qua, 30 ngày qua).
- Danh sách 5 sản phẩm bán chạy nhất được xếp hạng theo doanh thu.

#### 7. 👥 Nhân viên & Cài đặt (`/dashboard/users`, `/dashboard/settings`)
- **Quản lý nhân viên**: Bảng hiển thị thông tin nhân viên, vai trò (Cashier/Kitchen/Admin) kèm badge màu sắc và trạng thái hoạt động.
- **Cài đặt cửa hàng**: Form chỉnh sửa thông tin cửa hàng như tên quán, địa chỉ, số điện thoại, giờ mở cửa và logo.

### 9.4 Real-time & WebSocket Synchronization
- Khi kết nối được thiết lập, POS client sẽ tự động join vào room `store:{id}` và room bếp `store:{id}:kitchen`.
- **Sự kiện tích hợp**:
  - `new_order`: Nhận đơn mới từ Customer App → Toast thông báo nổi + tự động phát âm thanh alert báo hiệu.
  - `order_status_changed`: Cập nhật trạng thái Kanban của đơn khi có thay đổi.
  - `item_status_changed`: Cập nhật trạng thái từng món trong vé bếp.
  - `payment_completed`: Đồng bộ trạng thái đã thanh toán của hóa đơn.

### 9.5 Kết Quả Build & Tối Ưu Hóa Bundle
- Dự án Next.js build hoàn toàn sạch, không có lỗi TypeScript hoặc warning của ESLint.
- Dữ liệu dung lượng First Load JS:
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    1.65 kB         103 kB
├ ○ /_not-found                            979 B         103 kB
├ ○ /dashboard                             139 B         102 kB
├ ○ /dashboard/kitchen                   3.52 kB         175 kB
├ ○ /dashboard/menu                      7.97 kB         167 kB
├ ○ /dashboard/orders                     6.4 kB         180 kB
├ ○ /dashboard/reports                    113 kB         271 kB
├ ○ /dashboard/settings                  5.25 kB         161 kB
├ ○ /dashboard/tables                      13 kB         171 kB
├ ○ /dashboard/users                     2.54 kB         161 kB
└ ○ /login                               5.08 kB         161 kB
```

---

## 10. Roadmap — Các Phase Tiếp Theo

| Phase | Nội dung | Trạng thái |
|-------|----------|------------|
| **Phase 0** | Monorepo & Hạ tầng | ✅ |
| **Phase 1** | Database & Backend Core | ✅ |
| **Phase 2** | WebSocket Real-time | ✅ |
| **Phase 3** | Frontend — Customer Web App | ✅ |
| **Phase 4** | Frontend — POS/Admin Panel (Next.js): Dashboard, Quản lý đơn, Kitchen Display, Menu CRUD, Thanh toán | ✅ |
| **Phase 5** | Testing & QA: E2E tests, Unit tests, Load testing, Security audit | ⬜ |
| **Phase 6** | Deployment: Vercel (FE), Railway (BE), CI/CD | ⬜ |

### Business Logic Quan Trọng Cần Nhớ

1. **Order Lifecycle**: `PENDING` → (Cashier) `CONFIRMED` → (Kitchen items all SERVED) → auto `COMPLETED`
2. **Gọi thêm món**: Tạo items với `order_round` tăng dần, reset order status về `PENDING`
3. **Session**: Mỗi QR scan tạo/reuse session ACTIVE. Session expires khi thanh toán xong.
4. **Thanh toán**: Chỉ hỗ trợ CASH tại quầy. Tạo Payment record + set `payment_status = PAID` + expire session.
5. **Hệ thống 1 quán**: Không cần multi-tenant logic phức tạp.
6. **Cart Persist**: Giỏ hàng lưu trong localStorage, tồn tại qua refresh. ID = product+variant+options combo.


