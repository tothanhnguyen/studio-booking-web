# UI lịch studio

## Route và mục đích

`/admin/schedule` có hai form: thay toàn bộ giờ làm việc của một phòng/thứ và tạo blocked slot.

## Bản đồ code

- Route: `src/app/admin/schedule/page.tsx`.
- Editor/forms: `src/features/availability/presentation/schedule-editor.tsx`.
- Actions: `src/app/admin/schedule/actions.ts`, `src/app/admin/blocked-slots/actions.ts`.
- Validation/policy: `src/features/availability/application/manage-schedule.ts`.
- Time conversion: `date-fns-tz` với `Asia/Ho_Chi_Minh`.

## Có thể sửa

- **UI-only:** intro, form layout, labels, hint và message.
- **Data:** submit working hours thay toàn bộ windows của room/weekday; block tạo record mới.
- **Business:** windows không chồng, end sau start, blocked slot cùng một ngày local.

## Cách sửa an toàn

1. Giữ format windows `HH:mm-HH:mm`, phân cách bằng dấu phẩy.
2. Giữ weekday 0 Chủ nhật → 6 Thứ bảy.
3. Giữ conversion `datetime-local` sang UTC bằng `fromZonedTime`.
4. Nếu thay form structured hơn, vẫn gửi `{ openMinute, closeMinute }`.

## Lưu ý

Save giờ làm việc là replace, không append. Trang blocked slots riêng dùng để xem/xóa block.

## Xác minh

```bash
npm run test -- src/features/availability
npm run test:e2e -- tests/e2e/admin-schedule.spec.ts
npm run lint && npm run typecheck && npm run build
```
