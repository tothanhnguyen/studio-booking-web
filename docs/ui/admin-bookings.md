# UI quản lý booking

## Route và mục đích

`/admin/bookings` hiển thị toàn bộ booking, filter status, tổng kết quả và pagination.

## Bản đồ code

- Route: `src/app/admin/bookings/page.tsx`.
- List/filter/pagination: `src/features/dashboard/presentation/booking-list.tsx`, `booking-filters.tsx`.
- Badge: `booking-status-badge.tsx`.
- Query: `src/features/dashboard/application/admin-booking-queries.ts`.
- Repository: `src/features/dashboard/infrastructure/prisma-dashboard-booking-repository.ts`.

## Có thể sửa

- **UI-only:** heading, list card, filter, badge và pagination.
- **Data:** status/page search params được parse; admin list dùng page size 20.
- **Shared:** list/filter cũng dùng account page, nên thay đổi component có ảnh hưởng cả hai.

## Cách sửa an toàn

1. Sửa copy page ở route; sửa row/filter trong shared components.
2. Thêm trạng thái phải cập nhật type, label, style và policy/schema trước.
3. Giữ link detail base `/admin/bookings`.
4. Giữ filter invalid trở về “Tất cả”, page invalid trở về 1.

## Lưu ý

Không lọc ở client trên một page kết quả; filter hiện chạy server query qua URL.

## Xác minh

```bash
npm run test -- src/features/dashboard
npm run test:e2e -- tests/e2e/dashboards.spec.ts tests/e2e/assisted-lifecycle.spec.ts
npm run lint && npm run typecheck && npm run build
```
