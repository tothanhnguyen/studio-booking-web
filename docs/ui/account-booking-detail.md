# UI chi tiết booking khách hàng

## Route và mục đích

`/account/bookings/[bookingId]` hiển thị lịch, tiền, trạng thái và form hủy booking của chính khách.

## Bản đồ code

- Route/form: `src/app/account/bookings/[id]/page.tsx`.
- Server action: `src/app/account/bookings/[id]/actions.ts`.
- Detail/badge: `src/features/dashboard/presentation/booking-detail.tsx`, `booking-status-badge.tsx`.
- Query owned: `src/features/dashboard/application/customer-booking-queries.ts`.
- Cancel policy: `src/features/booking/application/cancel-booking.ts`.

## Có thể sửa

- **UI-only:** heading, card grid, labels, form layout và button style.
- **Business:** điều kiện hiện form hiện chỉ ẩn khi CANCELLED; backend vẫn quyết định có được hủy.
- **Security:** query phải là `getCustomerBooking(actor, id)`; booking không thuộc user trả 404.

## Cách sửa an toàn

1. Sửa layout dùng chung trong `BookingDetail` và kiểm tra admin detail.
2. Giữ input reason `required` và server action.
3. Không dùng điều kiện UI thay cho cancel policy 24 giờ.
4. Nếu đổi label payment/refund, giữ raw state đủ cho vận hành.

## Lưu ý

Hủy booking paid chuyển refund `REQUESTED`; nút UI không tự hoàn tiền.

## Xác minh

```bash
npm run test -- src/features/dashboard/application/customer-booking-queries.test.ts src/features/booking/application/cancel-booking.test.ts
npm run test:e2e -- tests/e2e/dashboards.spec.ts
npm run lint && npm run typecheck && npm run build
```
