# 📋 Smart Order QR — Task Tracker

## 🔷 PHASE 0: Khởi tạo Monorepo & Hạ tầng ✅

- [x] Monorepo (Turborepo + root config)
- [x] apps/api (NestJS 11), apps/customer (Next.js 15), apps/pos (Next.js 15)
- [x] packages/shared-types (enums, interfaces, DTOs)
- [x] Docker Compose (PostgreSQL 16 + Redis 7 + pgAdmin 4)
- [x] Environment config (.env)

## 🔷 PHASE 1: Database & Backend Core ✅

- [x] 16 Database Entities + barrel export
- [x] Seed data (1 store, 10 tables, 3 users, 20 products, 38 variants, 14 options)
- [x] Database Migration (InitialSchema)
- [x] 8 API Modules: Auth, Store, Tables, Sessions, Menu, Orders, ServiceRequests, Notifications
- [x] Global: ExceptionFilter + TransformInterceptor + ValidationPipe
- [x] Build + Server test thành công

## 🔷 PHASE 2: WebSocket Real-time ✅

- [x] 2.1 — Socket.IO Gateway (`order.gateway.ts`) + Module (`@Global`)
- [x] 2.2 — Room management: `store:{id}`, `store:{id}:kitchen`, `session:{token}`
- [x] 2.3 — Events tích hợp vào OrdersService: `new_order`, `order_items_added`, `order_status_changed`, `item_status_changed`, `payment_completed`
- [x] 2.4 — Events tích hợp vào ServiceRequestsService: `service_request_created`
- [x] 2.5 — Fix build script (`tsc -p tsconfig.json` thay cho `nest build`)
- [x] 2.6 — Fix transaction bug (getOrderDetail() gọi SAU transaction commit)
- [x] 2.7 — Integration Test: **53/53 tests PASS** ✅

### Test Results (53 tests)
```
Group 1: Server Health          — 2/2 ✅
Group 2: Auth Module            — 7/7 ✅
Group 3: Store Module           — 3/3 ✅
Group 4: Menu Module            — 5/5 ✅
Group 5: Tables Module          — 5/5 ✅
Group 6: Sessions Module        — 5/5 ✅
Group 7: Orders — Tạo đơn      — 6/6 ✅
Group 8: Orders — Trạng thái   — 3/3 ✅
Group 9: Kitchen workflow       — 4/4 ✅ (incl. auto-complete)
Group 10: Service Requests      — 4/4 ✅
Group 11: Notifications         — 2/2 ✅
Group 12: Payment               — 3/3 ✅
Group 13: Gọi thêm món         — 4/4 ✅
```

## 🔷 PHASE 3: Frontend — Customer Web App ✅

### 3.1 Foundation Layer
- [x] Design System — `globals.css` (TailwindCSS 4 theme: colors, shadows, animations, scrollbar)
- [x] Root Layout — `layout.tsx` (Inter + Playfair Display fonts, Toaster config)
- [x] Root Page — `page.tsx` (Fallback khi không có QR context)
- [x] API Client — `lib/api.ts` (Generic fetch wrapper, 10+ endpoint functions)
- [x] Socket Client — `lib/socket.ts` (WebSocket singleton, room join, 4 event listeners)
- [x] Formatters — `lib/format.ts` (Price, time, date, order number, relative time)
- [x] ESLint Config — `eslint.config.mjs` (Tuned rules cho project)

### 3.2 Zustand Stores
- [x] Session Store — `store/session-store.ts` (sessionToken, storeInfo, tableInfo, isInitialized)
- [x] Cart Store — `store/cart-store.ts` (items, addItem, updateQuantity, persist localStorage)
- [x] Order Store — `store/order-store.ts` (currentOrder, updateOrderStatus, updateItemStatus)

### 3.3 UI Components
- [x] Button — `components/ui/Button.tsx` (primary/secondary/ghost/danger, 3 sizes)
- [x] Badge — `components/ui/Badge.tsx` (popular/soldout/pending/cooking/served/success/warning)
- [x] BottomSheet — `components/ui/BottomSheet.tsx` (framer-motion, drag-to-dismiss)
- [x] QuantitySelector — `components/ui/QuantitySelector.tsx` (min/max, brand-colored)
- [x] Skeleton — `components/ui/Skeleton.tsx` (shimmer animation, card/text/circle/rect)

### 3.4 State Components
- [x] EmptyCart — `components/states/EmptyCart.tsx`
- [x] SessionExpired — `components/states/SessionExpired.tsx`
- [x] NetworkError — `components/states/NetworkError.tsx`
- [x] InvalidQR — `components/states/InvalidQR.tsx`

### 3.5 Custom Hooks
- [x] useMenu — `hooks/useMenu.ts` (fetch menu + options, search/filter, category state)
- [x] useOrder — `hooks/useOrder.ts` (submitOrder, addMoreItems, fetchBySession, fetchDetail)
- [x] useSocket — `hooks/useSocket.ts` (auto-connect, real-time listeners, toast notifications)
- [x] useServiceRequest — `hooks/useServiceRequest.ts` (callStaff, requestBill, otherRequest)

### 3.6 Pages & Page Components
- [x] Order Layout — `(order)/[storeSlug]/layout.tsx` (WebSocket init wrapper)
- [x] **Landing Page** — `(order)/[storeSlug]/page.tsx` (QR init, store info, table card, animated CTA)
- [x] **Menu Page** — `(order)/[storeSlug]/menu/page.tsx`
  - [x] SearchBar (focus animation, clear button)
  - [x] CategoryTabs (horizontal scroll, auto-scroll active tab)
  - [x] ProductCard (image, name, price, Hot badge, sold-out overlay, cart qty badge)
  - [x] ProductDetailSheet (size/đường/đá/topping, notes, quantity, "Thêm — 45.000đ")
  - [x] FloatingCartButton (fixed bottom, item count + total price, spring animation)
- [x] **Cart Page** — `(order)/[storeSlug]/cart/page.tsx`
  - [x] CartItem (image, variant/options tags, quantity controls, subtotal, remove)
  - [x] Hỗ trợ "Gọi thêm món" vào đơn đang xử lý
- [x] **Tracking Page** — `(order)/[storeSlug]/tracking/page.tsx`
  - [x] OrderTimeline (4 steps, pulsing active, cancelled state)
  - [x] OrderItemsList (grouped by order round, per-item status badges)
  - [x] ServiceRequestPopup (Gọi nhân viên / Tính tiền / Yêu cầu khác)
  - [x] Thank You screen (khi payment_status = PAID)

### 3.7 Build Verification
- [x] Production Build — `npm run build` ✅ passed (warnings only, 0 errors)
```
Route                                       Size  First Load JS
┌ ○ /                                    1.27 kB         143 kB
├ ƒ /[storeSlug]                         3.52 kB         145 kB
├ ƒ /[storeSlug]/cart                    5.36 kB         156 kB
├ ƒ /[storeSlug]/menu                     8.9 kB         162 kB
└ ƒ /[storeSlug]/tracking                9.06 kB         162 kB
```

## 🔷 PHASE 4: Frontend — POS / Admin Panel (Next.js) ✅

### 4.1 Foundation Layer
- [x] globals.css — POS Design System (tokens, utilities, animations)
- [x] layout.tsx — Root layout (Inter + Playfair Display fonts, Toaster)
- [x] page.tsx — Root redirect to `/dashboard/orders`
- [x] lib/api.ts — API client with JWT Bearer token (38 API functions)
- [x] lib/socket.ts — Socket.IO client (connect, join room, event listeners)
- [x] lib/format.ts — Formatters (price, percent, date, time, relative time)
- [x] lib/utils.ts — cn(), debounce(), getInitials(), getRoleLabel(), getRoleColor()
- [x] stores/authStore.ts — Auth state (Zustand + localStorage persist)
- [x] stores/orderStore.ts — Orders state (CRUD, filters)
- [x] stores/notificationStore.ts — Notifications state
- [x] stores/uiStore.ts — UI state (sidebar collapsed, modals)

### 4.2 UI Components (14 components)
- [x] Button — 5 variants, 3 sizes, icon, loading, fullWidth
- [x] Badge — Status variants (pending, confirmed, cooking, completed, cancelled)
- [x] Input — Label, error, helper, left/right icons, forwardRef
- [x] Select — Options, placeholder, error, ChevronDown icon
- [x] Switch — Animated toggle (framer-motion spring)
- [x] Modal — Portal, AnimatePresence, 4 sizes, Escape close, overlay
- [x] Card — Padding variants, hover shadow, click handler
- [x] Skeleton — Shimmer loading with count repeat
- [x] EmptyState — Icon + title + description + action button
- [x] Avatar — Image/initials, 3 sizes, online indicator, deterministic color
- [x] Dropdown — Click-triggered, AnimatePresence, click outside close
- [x] Tabs — layoutId animated underline, count badges
- [x] SearchInput — Debounced 300ms, search icon, clear button
- [x] ConfirmDialog — 3 variants (danger/warning/info), uses Modal

### 4.3 Layout + Auth
- [x] Sidebar — Dark sidebar (260/72px), animated collapse, role-based nav, tooltip
- [x] Header — Sticky, dynamic page title, notification bell, user avatar
- [x] DashboardLayout — Sidebar + Header + content with margin transition
- [x] PageHeader — Title + subtitle + action buttons
- [x] (auth)/layout.tsx — Centered auth layout
- [x] (auth)/login/page.tsx — Premium login (Coffee icon, show/hide password, motion)
- [x] hooks/useAuth.ts — login, logout, checkAuth, role helpers
- [x] dashboard/layout.tsx — Auth guard + socket init + DashboardLayout
- [x] dashboard/page.tsx — Server redirect to `/dashboard/orders`

### 4.4 Orders (Kanban)
- [x] Orders page — Grid view, status tabs with counts, search, real-time socket
- [x] Order cards — Status border, item preview, price, relative time
- [x] Order detail panel — Slide-over from right (AnimatePresence)
- [x] Confirm/Reject/Pay actions in panel
- [x] Reject dialog with ConfirmDialog
- [x] hooks/useOrders.ts — fetch, confirm, reject, pay
- [x] hooks/useSocket.ts — Real-time events + sound notification

### 4.5 Kitchen Display (KDS)
- [x] Kitchen page — Grid tickets for CONFIRMED orders
- [x] Wait time badge — Color-coded (green < 5min, amber 5-10min, red > 10min)
- [x] Item status button — PENDING → COOKING → SERVED toggle
- [x] Sort oldest first, highlight long wait

### 4.6 Menu + Tables
- [x] Menu page — Category sidebar + product grid
- [x] Product cards — Image/placeholder, name, price, availability Switch
- [x] Create/edit category modal
- [x] Create/edit product modal (name, description, price, category, image)
- [x] Tables page — Grid with status-colored cards (border-top)
- [x] Area filter tabs (dynamic from data)
- [x] Hover actions (Edit/QR/Delete)
- [x] QR code modal (qrcode.react QRCodeSVG)
- [x] Create/edit table modal
- [x] Delete confirm dialog
- [x] hooks/useMenu.ts — CRUD categories + products, toggle availability
- [x] hooks/useTables.ts — CRUD tables, regenerate QR, update status

### 4.7 Notifications + Service Requests
- [x] Notification bell with unread count badge (in Header)
- [x] hooks/useNotifications.ts — fetch, mark read, mark all read
- [x] hooks/useServiceRequests.ts — fetch, acknowledge, resolve

### 4.8 Reports + Users + Settings
- [x] Reports page — 4 stat cards (revenue, orders, avg, completion rate)
- [x] Revenue bar chart (Recharts BarChart)
- [x] Top products list (ranked by revenue)
- [x] Period filter (today, 7 days, 30 days)
- [x] Users page — Staff table with avatar, role badges, status
- [x] Settings page — Store info form (name, address, phone, hours, logo)

### 4.9 Build Verification
- [x] `npx next build` — ✅ Compiled successfully (0 errors, 0 warnings)
- [x] All 10 routes generated under `/dashboard` (/, /login, /dashboard/orders, /dashboard/kitchen, /dashboard/menu, etc.)
- [x] ESLint & TypeScript clean

## 🔷 PHASE 5: Testing & QA
- [ ] 5.1–5.8 — E2E, Unit tests, Load testing, Security

## 🔷 PHASE 6: Deployment
- [ ] 6.1–6.8 — Vercel + Railway + CI/CD


