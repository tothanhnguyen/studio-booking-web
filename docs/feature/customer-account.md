# Tài khoản khách hàng

## Phạm vi

Khách đã đăng nhập xem booking thuộc `userId`, lọc/phân trang, xem chi tiết, claim booking guest và yêu cầu hủy.

## Bản đồ code

- Routes: `src/app/account/bookings/page.tsx`, `[id]/page.tsx`, `[id]/actions.ts`.
- Query: `src/features/dashboard/application/customer-booking-queries.ts`.
- UI chung: `dashboard/presentation/booking-list.tsx`, `booking-detail.tsx`, `booking-filters.tsx`.
- Claim: `src/features/auth/presentation/claim-bookings-banner.tsx`.
- Cancel policy: `src/features/booking/application/cancel-booking.ts`.

## Ranh giới thay đổi

- **UI-only:** heading, card/list/detail layout, label filter và pagination.
- **Data/security:** query phải luôn scope theo actor ID; không dùng query admin cho account.
- **Business:** khách chỉ hủy booking của mình và thường phải còn ít nhất 24 giờ.

## Cách sửa an toàn

1. Chỉnh view dùng chung thì kiểm tra cả account và admin vì chúng tái sử dụng component.
2. Nếu thêm filter, cập nhật parser, query filters và repository.
3. Giữ redirect login có `next=/account/bookings`.
4. Giữ action cancel server-side và yêu cầu lý do.

## Lưu ý

- List account dùng page size 10; query normalize giới hạn tối đa 50.
- Booking không thuộc actor trả 404 qua query owned.
- Booking paid bị hủy sẽ tạo yêu cầu refund, không tự hoàn tiền.

## Xác minh

```bash
npm run test -- src/features/dashboard/application/customer-booking-queries.test.ts src/features/booking/application/cancel-booking.test.ts
npm run test:integration -- tests/integration/dashboard-booking-repository.test.ts
npm run test:e2e -- tests/e2e/dashboards.spec.ts tests/e2e/guest-claim.spec.ts
npm run lint && npm run typecheck && npm run build
```
