# UI quản lý dịch vụ

## Route và mục đích

`/admin/services` tạo/sửa dịch vụ, gán phòng và bật/tắt public booking.

## Bản đồ code

- Route/list/toggle: `src/app/admin/services/page.tsx`, `actions.ts`.
- Form: `src/features/service/presentation/service-form.tsx`.
- Validation/manager: `src/features/service/application/service-input.ts`, `manage-service.ts`.
- Repositories: `src/features/service/infrastructure/prisma-service-repository.ts`, room repository.
- Public view: `/services/[slug]`, room detail service list.

## Có thể sửa

- **UI-only:** form layout, label, default copy và message.
- **Data/business:** room, booking type, duration, buffer, price, active và order ảnh hưởng booking/availability.
- `currency` hiện bị khóa VND bằng hidden input và schema literal.

## Cách sửa an toàn

1. Giữ register key/type conversion (`valueAsNumber`) khớp schema.
2. Không cho lưu khi chưa có room option.
3. Sửa catalog thật qua form; seed chỉ cho môi trường khởi tạo.
4. Kiểm tra public service detail và wizard sau khi đổi duration/price/type.

## Lưu ý

Đổi giá không thay snapshot booking cũ. Đổi `ASSISTED`/`ROOM_ONLY` làm thay lifecycle sau payment.

## Xác minh

```bash
npm run test -- src/features/service src/features/availability
npm run test:e2e -- tests/e2e/admin-catalog.spec.ts tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
