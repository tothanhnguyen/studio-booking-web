# UI thanh toán booking

## Route và mục đích

`/booking/[bookingId]/payment` hiển thị countdown, VietQR, thông tin chuyển khoản, summary và trạng thái.

## Bản đồ code

- Route/authorization: `src/app/booking/[id]/payment/page.tsx`.
- QR/copy/status: `src/features/payment/presentation/vietqr-payment.tsx`, `copy-payment-value.tsx`, `payment-status.tsx`.
- Summary/countdown: `src/features/booking/presentation/booking-summary.tsx`, `hold-countdown.tsx`.
- Data/provider: `src/features/payment/application/get-payment-view.ts`.
- Style: `.payment-*` trong `src/styles/utilities.css`.

## Có thể sửa

- **UI-only:** heading, hướng dẫn, grid, QR frame, CTA và status copy.
- **Runtime data:** QR URL, account, amount và transfer content do provider tạo; không hardcode vào JSX.
- **Security:** route cần cookie guest đúng booking; thiếu/sai sẽ 404.

## Cách sửa an toàn

1. Sửa presentation/CSS, giữ copy button và QR có alt.
2. Giữ countdown lấy `holdExpiresAt`, không tự đặt thời gian mới ở client.
3. Đổi thông tin ngân hàng qua env, không qua UI.
4. Giữ link confirmation dùng cùng booking ID.

## Lưu ý

QR là ảnh từ `img.vietqr.io` được tạo lúc chạy. Dòng cọc 30% phải đồng bộ backend policy.

## Xác minh

```bash
npm run test -- src/features/payment/presentation src/features/payment/application/get-payment-view.test.ts
npm run test:e2e -- tests/e2e/guest-access.spec.ts tests/e2e/room-only-payment.spec.ts
npm run lint && npm run typecheck && npm run build
```
