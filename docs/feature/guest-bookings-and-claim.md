# Guest booking và nhận booking cũ

## Phạm vi

Khách chưa đăng nhập nhận cookie truy cập riêng cho booking. Sau khi đăng nhập bằng email đã xác minh, họ có thể nhận các booking guest cùng email.

## Bản đồ code

- Cookie/token: `src/features/booking/application/guest-cookie.ts`, `src/lib/security/guest-token.ts`.
- Quyền xem guest: `src/features/booking/application/get-guest-booking.ts`, `src/features/payment/application/get-payment-view.ts`.
- Tạo cookie: `src/features/booking/application/booking-actions.ts`.
- Claim: `src/features/auth/application/claim-guest-bookings.ts`, `claim-actions.ts`, `presentation/claim-bookings-banner.tsx`.
- Repository: `src/features/booking/infrastructure/prisma-booking-repository.ts`.

## Ranh giới thay đổi

- **UI-only:** banner, message và vị trí nút claim.
- **Security/data:** tên/path/expiry cookie, token hash và điều kiện email verified không được xem như chỉnh UI.
- **Claim:** chỉ booking có `userId = null` và email khớp không phân biệt hoa thường được nhận.

## Cách sửa an toàn

1. Giữ cookie HTTP-only, SameSite Lax, Secure ở production và path theo booking.
2. Không lưu raw token trong DB; DB chỉ giữ `guestAccessTokenHash`.
3. Khi sửa claim, giữ yêu cầu actor có `emailVerified` và normalized email.
4. Không hiển thị việc booking có tồn tại trước khi xác thực token.

## Lưu ý

- Payment và confirmation trả 404 nếu thiếu/sai cookie guest.
- Cookie hết hạn cùng hold; người có tài khoản xem booking đã claim qua account, không qua cookie.
- Claim là update theo email, nên đổi email booking có ảnh hưởng quyền nhận.

## Xác minh

```bash
npm run test -- src/features/booking/application/get-guest-booking.test.ts src/features/auth/application/claim-guest-bookings.test.ts
npm run test:integration -- tests/integration/guest-claim.test.ts
npm run test:e2e -- tests/e2e/guest-access.spec.ts tests/e2e/guest-claim.spec.ts
npm run lint && npm run typecheck && npm run build
```
