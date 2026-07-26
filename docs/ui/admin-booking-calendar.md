# UI lịch booking quản trị

## Route và mục đích

`/admin/bookings/calendar` hiển thị booking theo ngày trong khoảng chọn, theo `Asia/Ho_Chi_Minh`.

## Bản đồ code

- Route/date parsing: `src/app/admin/bookings/calendar/page.tsx`.
- Calendar UI/format: `src/features/dashboard/presentation/booking-calendar.tsx`.
- Query/range guard: `src/features/dashboard/application/admin-booking-queries.ts`.
- Time helpers: `src/lib/time/studio-time.ts`.
- Badge/detail link: `booking-status-badge.tsx`, `/admin/bookings/[id]`.

## Có thể sửa

- **UI-only:** form range, card ngày, row booking, empty state và responsive columns.
- **Data:** `from`/`to` là `YYYY-MM-DD` trong URL; query dùng UTC boundary chuyển từ giờ studio.
- **Business:** backend giới hạn khoảng nhỏ hơn/equal 92 ngày; page clamp ngày kết thúc.

## Cách sửa an toàn

1. Giữ input `type="date"`, name `from`/`to` và timezone label.
2. Sửa format hiển thị qua `formatInTimeZone`, không dùng timezone browser mặc định.
3. Giữ group key `yyyy-MM-dd` theo studio timezone.
4. Nếu đổi giới hạn range, đồng bộ page và query test.

## Lưu ý

Range repository dùng end-exclusive. Nếu `to < from`, page đặt `to = from`.

## Xác minh

```bash
npm run test -- src/features/dashboard/presentation/booking-calendar.test.tsx src/features/dashboard/application/admin-booking-queries.test.ts
npm run test:e2e -- tests/e2e/dashboards.spec.ts
npm run lint && npm run typecheck && npm run build
```
