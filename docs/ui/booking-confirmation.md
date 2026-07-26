# UI xác nhận booking

## Route và mục đích

`/booking/[bookingId]/confirmation` cho guest xem trạng thái payment/booking, mã booking, summary và số tiền còn lại.

## Bản đồ code

- Route/layout: `src/app/booking/[id]/confirmation/page.tsx`.
- Status/copy: `src/features/payment/presentation/payment-status.tsx`.
- Summary: `src/features/booking/presentation/booking-summary.tsx`.
- Data/permission: `src/features/payment/application/get-payment-view.ts`, `guest-cookie.ts`.
- Style: `.confirmation-*`, `.payment-status*`, `.booking-summary*` trong `src/styles/utilities.css`.

## Có thể sửa

- **UI-only:** heading, text “bước tiếp theo”, layout rail, format amount và CTA về studio.
- **Data:** status, remaining amount, room/service/time đến từ booking snapshot.
- **Security:** route cần cookie guest; không thay bằng query booking công khai.

## Cách sửa an toàn

1. Sửa copy ở route hoặc helper `getPaymentStatusDescription()`.
2. Nếu thêm trạng thái hiển thị, kiểm tra mọi booking/payment status.
3. Giữ mã booking đầy đủ cho đối soát và `type-mono` cho số.
4. Không hiển thị PII mới trong confirmation guest.

## Lưu ý

Trang không tự poll payment trong code hiện tại; người dùng mở/reload để lấy trạng thái server mới.

## Xác minh

```bash
npm run test -- src/features/payment src/features/booking/presentation
npm run test:e2e -- tests/e2e/guest-access.spec.ts tests/e2e/room-only-payment.spec.ts
npm run lint && npm run typecheck && npm run build
```
