# UI wizard đặt lịch

## Route và mục đích

`/booking/[serviceId]` dẫn người dùng qua liên hệ → ngày → khung giờ → xác nhận → tạo giữ chỗ.

## Bản đồ code

- Route/service query: `src/app/booking/[id]/page.tsx`.
- Wizard: `src/features/booking/presentation/booking-wizard.tsx`.
- Progress/field/button: `booking-progress.tsx`, `src/components/ui/form-field.tsx`, `action.ts`.
- Style: `src/styles/forms.css` và các block `.booking-*` trong `src/styles/utilities.css`.
- API slot: `src/app/api/availability/route.ts`.

## Có thể sửa

- **UI-only:** tên bước, copy, bố cục context/window, label và format hiển thị.
- **Form/data:** đổi `name`/schema/field cần sửa command và persistence.
- **Business:** hold 10 phút, slot, giá và deposit không nằm riêng trong UI.

## Cách sửa an toàn

1. Sửa từng state trong `BookingWizard`; giữ navigation back/next và disabled state.
2. Giữ timezone formatter `Asia/Ho_Chi_Minh`.
3. Nếu thêm field, cập nhật client Zod + booking command + repository + tests.
4. Giữ success redirect `/booking/${bookingId}/payment`.

## Lưu ý

Route `[id]` là service ID. Sau submit, ID trong URL là booking ID và quyền guest dựa vào cookie.

## Xác minh

```bash
npm run test -- src/features/booking/presentation
npm run test:e2e -- tests/e2e/guest-booking.spec.ts
npm run lint && npm run typecheck && npm run build
```
