# 📋 Sprint 2: Khuyến mãi & Mã giảm giá — TASK TRACKER

## 1. Database & Shared Types (Foundation)
- [x] 1.1 — Tạo Entity `Promotion`
- [x] 1.2 — Tạo Entity `OrderPromotion`
- [x] 1.3 — Sửa Entity `Order` (thêm discount_amount, final_amount)
- [x] 1.4 — Cập nhật barrel export `entities/index.ts`
- [x] 1.5 — Cập nhật `shared-types/enums` (PromotionType)
- [x] 1.6 — Cập nhật `shared-types/dto` (coupon DTOs, CreateOrderDto)

## 2. Backend API
- [x] 2.1 — Tạo DTOs (create-promotion.dto, validate-coupon.dto)
- [x] 2.2 — Tạo PromotionsService (CRUD + validate + apply)
- [x] 2.3 — Tạo PromotionsController (7 endpoints)
- [x] 2.4 — Tạo PromotionsModule
- [x] 2.5 — Sửa OrdersService (tích hợp discount vào createOrder + payment)
- [x] 2.6 — Sửa OrdersModule (import PromotionsModule)
- [x] 2.7 — Sửa CreateOrderDto API (thêm coupon_code)
- [x] 2.8 — Cập nhật AppModule (import PromotionsModule)
- [x] 2.9 — Build & verify backend

## 3. Frontend — Customer App
- [x] 3.1 — Thêm API functions coupon vào `api.ts`
- [x] 3.2 — Tạo hook `useCoupon.ts`
- [x] 3.3 — Sửa Cart page (input mã + hiển thị chiết khấu)
- [x] 3.4 — Sửa Menu page (banner khuyến mãi)
- [x] 3.5 — Sửa `useOrder.ts` (truyền coupon_code)
- [x] 3.6 — Sửa `order-store.ts` (thêm discount fields)

## 4. Frontend — POS Panel
- [x] 4.1 — Thêm API functions promotions vào POS `api.ts`
- [x] 4.2 — Tạo trang Quản lý Khuyến mãi (`/dashboard/promotions`)
- [x] 4.3 — Sửa Sidebar (thêm menu item)
