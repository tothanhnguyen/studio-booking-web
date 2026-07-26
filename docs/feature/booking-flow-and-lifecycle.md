# Luồng booking và vòng đời

## Phạm vi

Wizard lấy thông tin liên hệ, ngày, slot, xác nhận, tạo hold 10 phút rồi chuyển đến payment.

## Bản đồ code

- UI: `src/features/booking/presentation/booking-wizard.tsx`, `booking-progress.tsx`, `booking-summary.tsx`, `hold-countdown.tsx`.
- Server action/use case: `application/booking-actions.ts`, `create-booking.ts`.
- Persistence/lock: `infrastructure/prisma-booking-repository.ts`, `booking-lock.ts`.
- Policy: `domain/booking-policy.ts`, `application/cancel-booking.ts`, `confirm-assisted-booking.ts`.
- Routes: `src/app/booking/[id]/**`; `[id]` đầu tiên là service ID, sau create là booking ID.

## Ranh giới thay đổi

- **UI-only:** tên bước, bố cục, copy và component summary.
- **Data:** thêm field cần cập nhật Zod schema, command, Prisma create và UI.
- **Business:** hold 10 phút, lưới 15 phút, overlap, lifecycle và cancel window 24 giờ nằm ở backend.

## Cách sửa an toàn

1. Với copy/bố cục, chỉ sửa presentation và CSS.
2. Với input mới, cập nhật schema client lẫn `booking-command.ts`, repository và test.
3. Với trạng thái, sửa `canTransitionBooking()` và tất cả use case gọi nó.
4. Giữ lock/transaction khi sửa create hold để tránh double booking.

## Lưu ý

- `ROOM_ONLY` được confirmed sau payment; `ASSISTED` chuyển `PENDING` rồi admin xác nhận.
- Customer chỉ hủy khi còn ít nhất 24 giờ; admin có quyền hủy rộng hơn.
- Hủy booking đã paid chuyển refund sang `REQUESTED`.

## Xác minh

```bash
npm run test -- src/features/booking
npm run test:integration -- tests/integration/booking-concurrency.test.ts tests/integration/booking-rollback.test.ts
npm run test:e2e -- tests/e2e/guest-booking.spec.ts tests/e2e/assisted-lifecycle.spec.ts
npm run lint && npm run typecheck && npm run build
```
