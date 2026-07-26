# Vận hành quản trị

## Phạm vi

Admin quản lý catalog, lịch, block, booking lifecycle, calendar, payment/refund và dashboard.

## Bản đồ code

- Guard/shell: `src/app/admin/layout.tsx`, `src/features/dashboard/presentation/admin-shell.tsx`.
- Routes/actions: `src/app/admin/**`.
- Booking query/UI: `src/features/dashboard/application/admin-booking-queries.ts`, `presentation/*`.
- Catalog: `src/features/studio-room/**`, `src/features/service/**`.
- Schedule: `src/features/availability/**`; refund: `src/features/payment/application/update-refund-status.ts`.

## Ranh giới thay đổi

- **UI-only:** navigation, heading, card/table/list và form layout.
- **Operations/data:** action tạo/sửa/active, confirm/reject/cancel/refund ghi DB.
- **Security:** mọi route admin được guard ở layout; action vẫn phải tự require `ADMIN`.

## Cách sửa an toàn

1. Thêm trang admin: thêm route, link trong `admin-shell.tsx` và guard server action.
2. Thêm lifecycle action: kiểm tra policy, idempotency, audit/notification cần thiết và revalidate path.
3. Query lịch tối đa 92 ngày; UI hiện clamp tới 91 ngày cộng end-exclusive.
4. Với catalog/lịch, dùng manager/application layer thay vì gọi Prisma trực tiếp từ client.

## Lưu ý

- Customer truy cập admin nhận 404; unauthenticated được redirect login.
- `/admin/payments` lấy tối đa 100 booking paid hoặc refund cần theo dõi.
- Một số route admin gọi Prisma trực tiếp ở server page; không chuyển dữ liệu nhạy cảm sang client.

## Xác minh

```bash
npm run test -- src/features/dashboard src/features/auth/application/require-role.test.ts
npm run test:integration -- tests/integration/dashboard-booking-repository.test.ts tests/integration/schedule-repository.test.ts
npm run test:e2e -- tests/e2e/admin-denial.spec.ts tests/e2e/admin-catalog.spec.ts tests/e2e/admin-schedule.spec.ts tests/e2e/assisted-lifecycle.spec.ts
npm run lint && npm run typecheck && npm run build
```
