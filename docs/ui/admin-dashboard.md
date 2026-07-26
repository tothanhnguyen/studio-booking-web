# UI dashboard quản trị

## Route và mục đích

`/admin` hiển thị tổng booking và lối tắt sang danh sách booking/lịch vận hành trong admin shell.

## Bản đồ code

- Route: `src/app/admin/page.tsx`.
- Guard/layout: `src/app/admin/layout.tsx`.
- Sidebar: `src/features/dashboard/presentation/admin-shell.tsx`.
- Query số booking: `src/features/dashboard/application/admin-booking-queries.ts`.
- Theme: token chung và Tailwind trực tiếp trong page/shell.

## Có thể sửa

- **UI-only:** heading, intro, CTA, sidebar labels/order, grid width và card style.
- **Data:** `recent.total` đến từ query page 1/page size 5; đừng hardcode con số.
- **Security:** guard nằm ở admin layout và không được bỏ khi đổi layout.

## Cách sửa an toàn

1. Sửa overview ở page, navigation dùng chung ở `AdminShell`.
2. Khi thêm admin page, thêm link rõ ràng và vẫn đặt dưới `/admin`.
3. Kiểm tra sidebar desktop/mobile và focus link.
4. Không đưa dữ liệu khách hàng vào dashboard nếu chưa có yêu cầu/permission rõ.

## Lưu ý

Admin layout đã gọi guard; page vẫn gọi `getAdminPageActor()` cho query được phân quyền.

## Xác minh

```bash
npm run test -- src/features/dashboard/application/admin-booking-queries.test.ts src/features/auth/application/require-role.test.ts
npm run test:e2e -- tests/e2e/dashboards.spec.ts tests/e2e/admin-denial.spec.ts
npm run lint && npm run typecheck && npm run build
```
