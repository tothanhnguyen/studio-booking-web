# UI chi tiết booking quản trị

## Route và mục đích

`/admin/bookings/[bookingId]` hiển thị booking/customer và action confirm, reject/cancel, cập nhật refund.

## Bản đồ code

- Route/forms: `src/app/admin/bookings/[id]/page.tsx`.
- Server actions: `src/app/admin/bookings/[id]/actions.ts`.
- Detail: `src/features/dashboard/presentation/booking-detail.tsx`.
- Lifecycle: `src/features/booking/application/confirm-assisted-booking.ts`, `cancel-booking.ts`.
- Refund: `src/features/payment/application/update-refund-status.ts`.

## Có thể sửa

- **UI-only:** layout, labels, nhóm action, button colors và customer card.
- **Business:** điều kiện hiện nút phải khớp policy server; server vẫn là nguồn quyết định.
- **Data:** form reason/status/note ghi DB và phát notification/revalidate.

## Cách sửa an toàn

1. Không đổi value enum trong `<option>`; chỉ đổi label nếu cần.
2. Giữ action server và guard admin; không chuyển lifecycle sang client fetch tùy ý.
3. Với action mới, thêm use case/policy/test trước khi thêm nút.
4. Hiển thị customer data tối thiểu, không đưa vào log/client không cần thiết.

## Lưu ý

ASSISTED paid ở `PENDING` mới có nút confirm. Refund chỉ đi theo transition backend cho phép.

## Xác minh

```bash
npm run test -- src/features/booking/application/confirm-assisted-booking.test.ts src/features/payment/application/update-refund-status.test.ts
npm run test:e2e -- tests/e2e/assisted-lifecycle.spec.ts
npm run lint && npm run typecheck && npm run build
```
