# Thiết kế lại giao diện POS — Đồng bộ tone nâu & Premium UI

## Mô tả
Giao diện POS hiện tại có hai vấn đề chính:
1. **Sidebar quá tối** — sử dụng nền đen (`#1a1412`) thay vì tone nâu sáng
2. **Màu sắc không đồng nhất** — orders page, reports page, reviews page dùng **hardcoded Tailwind colors** (amber, gray, emerald, blue) thay vì **semantic design tokens** (`text-brand-primary`, `bg-bg-secondary`, v.v.)

Mục tiêu: đồng bộ toàn bộ giao diện POS với palette nâu coffee premium đã có trong `globals.css`, làm sidebar sáng hơn, thêm các token còn thiếu, và cải thiện hover/animation effects.

---

## Phân tích hiện trạng

### Palette đang định nghĩa (globals.css)
| Token | Hex | Mô tả |
|---|---|---|
| `brand-primary` | `#6F4E37` | Nâu chủ đạo |
| `brand-secondary` | `#A0785D` | Nâu nhạt hơn |
| `brand-light` | `#D4B896` | Nâu rất nhạt |
| `brand-dark` | `#3E2723` | Nâu đen |
| `bg-primary` | `#FAFAF8` | Nền chính |
| `bg-secondary` | `#F5F0EB` | Nền phụ |
| `border` | `#E8E0D8` | Viền |
| `text-primary` | `#1A1A1A` | Chữ chính |
| `text-secondary` | `#6B6B6B` | Chữ phụ |

### Tokens còn THIẾU (cần bổ sung)
| Token | Hex | Mục đích |
|---|---|---|
| `text-muted` | `#9CA3AF` | Chữ mờ |
| `bg-card` | `#FFFFFF` | Nền card |
| `border-light` | `#F0EBE4` | Viền nhẹ |
| `shadow-card` | `rgba(111,78,55,0.06)...` | Shadow cho card |
| `shadow-card-hover` | `rgba(111,78,55,0.12)...` | Shadow hover |
| `success` | `#059669` | Trạng thái thành công |
| `error` | `#DC2626` | Trạng thái lỗi |
| `warning` | `#D97706` | Trạng thái cảnh báo |
| `info` | `#2563EB` | Thông tin |

### Các trang sử dụng hardcoded colors (cần sửa)

| Trang | Mức độ | Vấn đề chính |
|---|---|---|
| **Sidebar** | 🔴 Cao | Nền đen quá tối, text amber hardcoded |
| **Dashboard layout** | 🟡 TB | `bg-gray-50` thay vì `bg-bg-primary` |
| **Orders page** | 🔴 Cao | Toàn bộ dùng hardcoded amber/gray/emerald |
| **Reports page** | 🔴 Cao | Hardcoded colors trong stat cards, charts |
| **Reviews page** | 🟡 TB | Filter buttons dùng hardcoded amber/gray |
| **Providers** | 🟢 Thấp | Loading screen dùng `bg-[#FAFAF8]` |

### Các trang đã dùng tokens tốt (chỉ cần polish)
- ✅ Tables page
- ✅ Menu page  
- ✅ Kitchen page
- ✅ Settings page
- ✅ Users page
- ✅ Login page

---

## Proposed Changes

### 1. Design System — globals.css

#### [MODIFY] [globals.css](file:///d:/smart-order/apps/pos/app/globals.css)

**Bổ sung tokens thiếu** vào `@theme` block:
```css
--color-text-muted: #9CA3AF;
--color-bg-card: #FFFFFF;
--color-border-light: #F0EBE4;
--color-success: #059669;
--color-success-bg: #ECFDF5;
--color-error: #DC2626;
--color-error-bg: #FEF2F2;
--color-warning: #D97706;
--color-warning-bg: #FFFBEB;
--color-info: #2563EB;
--color-info-bg: #EFF6FF;
--shadow-card: 0 2px 8px rgba(111,78,55,0.06), 0 0 1px rgba(111,78,55,0.08);
--shadow-card-hover: 0 8px 24px rgba(111,78,55,0.12), 0 2px 8px rgba(111,78,55,0.06);
```

**Thêm animation mới** cho hiệu ứng mượt:
- `@keyframes slide-in-right` — cho slide-over panel
- `@keyframes bounce-in` — cho loading logo
- `.data-table` — styles cho bảng dữ liệu admin
- Cải thiện `.order-card` hover effects

---

### 2. Sidebar — Chuyển từ tối sang sáng

#### [MODIFY] [Sidebar.tsx](file:///d:/smart-order/apps/pos/app/components/layout/Sidebar.tsx)

**Thay đổi chính:**
- Nền: từ `bg-gradient-to-b from-[#1a1412] via-[#221a15] to-[#1a1412]` → **`bg-white border-r border-border`** (sidebar sáng, sang trọng)
- Logo container: giữ gradient nâu `from-brand-primary to-brand-dark`
- Text "Smart Order": từ `text-white` → `text-text-primary`
- Subtitle: từ `text-amber-500/60` → `text-brand-secondary`
- Menu label: từ `text-amber-600/40` → `text-text-muted`
- Active item: từ `text-amber-400` + amber glow → `text-brand-primary` + `bg-brand-primary/8` background
- Inactive item: từ `text-gray-400` → `text-text-secondary`
- Icon active: từ `text-amber-400 drop-shadow` → `text-brand-primary`
- Icon inactive: từ `text-gray-500` → `text-text-muted`
- Active dot: từ `bg-amber-400 shadow-amber` → `bg-brand-primary`
- User section: text sáng thay vì tối
- Tooltip: `bg-brand-dark text-white` thay vì `bg-gray-900`
- Border separators: `border-border` thay vì `border-white/5`
- Collapse button icon: `text-text-muted` thay vì `text-amber-400/60`

---

### 3. Dashboard Layout

#### [MODIFY] [layout.tsx](file:///d:/smart-order/apps/pos/app/dashboard/layout.tsx)

- Thay `bg-gray-50` → `bg-bg-primary`

---

### 4. Header

#### [MODIFY] [Header.tsx](file:///d:/smart-order/apps/pos/app/components/layout/Header.tsx)

- Thêm subtle bottom shadow: `shadow-[0_1px_3px_rgba(111,78,55,0.06)]`
- Border: đã dùng `border-border` ✅

---

### 5. Orders Page — Đồng bộ hoàn toàn

#### [MODIFY] [page.tsx](file:///d:/smart-order/apps/pos/app/dashboard/orders/page.tsx)

**Status Tabs:**
- Active: từ `bg-gradient-to-r from-amber-800 to-amber-900` → `bg-brand-primary text-white shadow-md`
- Inactive: từ `bg-white text-gray-600 border-gray-200` → `bg-bg-card text-text-secondary border border-border hover:bg-bg-secondary hover:text-brand-primary`
- Count badge active: `bg-white/20` → giữ
- Count badge inactive: từ `bg-gray-100 text-gray-500` → `bg-bg-secondary text-text-muted`

**Search Input:**
- Từ `bg-white border-gray-200 focus:ring-amber-900/20 focus:border-amber-900` → `bg-bg-card border border-border focus:ring-brand-secondary/20 focus:border-brand-secondary`
- Search icon: từ `text-gray-400` → `text-text-muted`

**Order Cards:**
- Từ `bg-white border-gray-100` → `bg-bg-card border border-border`
- Left border colors: giữ semantic colors (amber, blue, emerald, red) vì chúng mang ý nghĩa trạng thái
- Order number: từ `text-gray-900` → `text-text-primary`
- Hash icon: từ `text-amber-600` → `text-brand-primary`
- Time: từ `text-gray-400` → `text-text-muted`
- Info text: từ `text-gray-600` → `text-text-secondary`
- Info icon: từ `text-gray-400` → `text-text-muted`
- Separator: từ `text-gray-300` → `text-border`
- Total gradient: từ `from-amber-800 to-amber-600` → `text-brand-primary font-bold` (đơn giản, đồng nhất)
- Payment badge PAID: giữ semantic green
- Payment badge UNPAID: giữ semantic amber
- Bottom border: từ `border-gray-50` → `border-border-light`

**Action Buttons:**
- Reject: giữ `bg-error-bg text-error hover:bg-error-bg/80`
- Confirm: giữ `bg-success-bg text-success hover:bg-success-bg/80`
- Payment CTA: từ `from-amber-600 to-amber-700` → `bg-brand-primary text-white hover:bg-brand-dark`

**Order Detail Slide-over:**
- Header: từ `bg-white/95` → `bg-bg-card/95 backdrop-blur-sm border-b border-border`
- Title: từ `text-gray-900` → `text-text-primary`
- Subtitle: từ `text-gray-500` → `text-text-secondary`
- Table info: từ `from-amber-50 to-orange-50` → `bg-bg-secondary border border-border`
- Item rows: từ `bg-gray-50 hover:bg-gray-100` → `bg-bg-secondary hover:bg-bg-secondary/80`
- Item names: từ `text-gray-900` → `text-text-primary`
- Item details: từ `text-gray-500` → `text-text-secondary`
- Price: từ `text-amber-900` → `text-brand-primary`

**Skeleton loading:**
- Từ `bg-white border-gray-200` → `bg-bg-card border border-border`
- Pulse bars: từ `bg-gray-200` → `bg-bg-secondary`

**Page header:**
- Từ `text-gray-900` / `text-gray-500` → `text-text-primary` / `text-text-secondary`

---

### 6. Reports Page — Đồng bộ

#### [MODIFY] [page.tsx](file:///d:/smart-order/apps/pos/app/dashboard/reports/page.tsx)

**Time Filters:**
- Same pattern as Orders tabs: `bg-brand-primary` active, token-based inactive

**Stat Cards:**
- Container: từ `bg-white border-gray-100` → `bg-bg-card border border-border`
- Title: từ `text-gray-500` → `text-text-secondary`
- Value: từ `text-gray-900` → `text-text-primary`
- Subtitle: từ `text-gray-400` → `text-text-muted`
- Icon backgrounds: dùng semantic tokens (`bg-success-bg`, `bg-info-bg`, `bg-warning-bg`, `bg-brand-primary/10`)
- Icon colors: dùng semantic tokens

**Chart:**
- Bar fill: từ `#78350f` → `#6F4E37` (brand-primary)
- Grid: từ `#f0f0f0` → `#F0EBE4` (border-light)
- Tooltip: border `#E8E0D8`, shadow brand-tinted

**Top Products:**
- Row hover: từ `bg-gray-50 hover:bg-gray-100` → `bg-bg-secondary hover:bg-bg-secondary/80`
- Ranking badges: sử dụng brand palette (#1 gold, #2 silver, #3 bronze giữ nguyên)
- Revenue text: từ `text-amber-900` → `text-brand-primary`

**Page header:**
- Từ `text-gray-900` / `text-gray-500` → `text-text-primary` / `text-text-secondary`

---

### 7. Reviews Page — Polish

#### [MODIFY] [page.tsx](file:///d:/smart-order/apps/pos/app/dashboard/reviews/page.tsx)

**Filter buttons:**
- Active: từ `bg-amber-600 text-white` → `bg-brand-primary text-white`
- Inactive: từ `bg-gray-100 text-gray-600 hover:bg-gray-200` → `bg-bg-secondary text-text-secondary hover:bg-border`

**Rating colors:**
- Average rating: từ `text-amber-600` → `text-brand-primary`
- Star icon fill: giữ amber (semantic cho sao)
- Rating bar fill: từ `bg-amber-400` → `bg-brand-secondary`
- Rating bar bg: từ `bg-gray-100` → `bg-bg-secondary`

**Table hover:** từ `hover:bg-gray-100` → `hover:bg-bg-secondary`

---

### 8. Providers — Token hóa

#### [MODIFY] [providers.tsx](file:///d:/smart-order/apps/pos/app/providers.tsx)

- Từ `bg-[#FAFAF8]` → `bg-bg-primary`
- Từ `from-amber-500 to-amber-700` → `from-brand-primary to-brand-dark`
- Từ `text-gray-400` → `text-text-muted`

---

### 9. UI Components — Token hóa các hardcoded hex

Các component sau dùng hardcoded hex `#xxxx` thay vì Tailwind tokens. Sẽ chuyển sang sử dụng CSS variable tokens:

#### [MODIFY] [Input.tsx](file:///d:/smart-order/apps/pos/app/components/ui/Input.tsx)
- `text-[#4A4A4A]` → `text-text-secondary`
- `text-[#9CA3AF]` → `text-text-muted`
- `text-[#1A1A1A]` → `text-text-primary`
- `border-[#E5E5E5]` → `border-border`
- `border-[#A0785D]` → `border-brand-secondary`
- `ring-[#A0785D]/20` → `ring-brand-secondary/20`
- `border-[#DC2626]` → `border-error`
- `ring-[#DC2626]/20` → `ring-error/20`
- `bg-[#F9FAFB]` → `bg-bg-secondary`

#### [MODIFY] [Button.tsx](file:///d:/smart-order/apps/pos/app/components/ui/Button.tsx)
- `from-[#6F4E37] to-[#5A3D2B]` → `from-brand-primary to-brand-dark`
- `hover:from-[#5A3D2B] hover:to-[#4A3223]` → `hover:from-brand-dark hover:to-[#3E2723]`
- `border-[#6F4E37]` → `border-brand-primary`
- `text-[#6F4E37]` → `text-brand-primary`
- `bg-[#6F4E37]/5` → `bg-brand-primary/5`
- `text-[#4A4A4A]` → `text-text-secondary`
- `bg-[#F5F0EB]` → `bg-bg-secondary`
- `bg-[#DC2626]` → `bg-error`
- `hover:bg-[#B91C1C]` → `hover:bg-red-800`
- `ring-[#A0785D]` → `ring-brand-secondary`

#### [MODIFY] [Switch.tsx](file:///d:/smart-order/apps/pos/app/components/ui/Switch.tsx)
- `bg-[#6F4E37]` → `bg-brand-primary`
- `ring-[#A0785D]` → `ring-brand-secondary`
- `text-[#4A4A4A]` → `text-text-secondary`

---

## Verification Plan

### Automated Tests
```bash
cd apps/pos && npm run build
```
Build Next.js để kiểm tra không có lỗi TypeScript hay CSS.

### Manual Verification
- Kiểm tra sidebar trên trình duyệt — phải sáng, tone nâu-trắng
- Kiểm tra orders page — cards, tabs, search đều đồng nhất tone nâu
- Kiểm tra reports page — stat cards, chart đồng nhất
- Kiểm tra reviews page — filter buttons đồng nhất
- Kiểm tra hover effects mượt mà trên tất cả interactive elements
- Kiểm tra responsive trên desktop (admin) và mobile (POS viewer)
- So sánh visual với customer menu app — tone phải match
