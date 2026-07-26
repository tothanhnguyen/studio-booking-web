# UI danh sách booking của tôi

## Route và mục đích

`/account/bookings` hiển thị booking thuộc tài khoản, filter status, pagination và banner claim guest booking.

## Bản đồ code

- Route/query wiring: `src/app/account/bookings/page.tsx`.
- Claim UI: `src/features/auth/presentation/claim-bookings-banner.tsx`.
- List/filter/pagination: `src/features/dashboard/presentation/booking-list.tsx`, `booking-filters.tsx`.
- Query owned: `src/features/dashboard/application/customer-booking-queries.ts`.
- Badge: `booking-status-badge.tsx`.

## Có thể sửa

- **UI-only:** heading, intro, khoảng cách, list card, filter label và badge colors.
- **Data:** filter/status/page đi qua search params; list phải tiếp tục scope actor ID.
- **Auth:** chưa đăng nhập redirect `/login?next=/account/bookings`.

## Cách sửa an toàn

1. Sửa page shell ở route, component lặp trong `dashboard/presentation`.
2. Nhớ component list/filter cũng dùng ở admin; kiểm tra cả hai.
3. Thêm filter phải cập nhật parser/query/repository.
4. Giữ label text trên badge, không chỉ đổi màu.

## Lưu ý

Page size account hiện là 10. Banner claim chỉ nhận booking chưa có owner và cùng email verified.

## Xác minh

```bash
npm run test -- src/features/dashboard src/features/auth/application/claim-guest-bookings.test.ts
npm run test:e2e -- tests/e2e/dashboards.spec.ts tests/e2e/guest-claim.spec.ts
npm run lint && npm run typecheck && npm run build
```
