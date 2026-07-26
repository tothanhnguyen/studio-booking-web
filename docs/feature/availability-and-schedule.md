# Lịch khả dụng và giờ vận hành

## Phạm vi

Slot được sinh theo giờ làm việc, duration + buffer, block, booking đang giữ/đã xác nhận và múi giờ Việt Nam.

## Bản đồ code

- API: `src/app/api/availability/route.ts`.
- Query/source: `src/features/availability/application/get-available-slots.ts`, `infrastructure/prisma-availability-source.ts`.
- Thuật toán: `domain/generate-slots.ts`, `domain/overlap.ts`.
- Quản trị: `application/manage-schedule.ts`, `presentation/schedule-editor.tsx`.
- Pages/actions: `src/app/admin/schedule`, `src/app/admin/blocked-slots`.

## Ranh giới thay đổi

- **UI-only:** label/form/layout trong `schedule-editor.tsx` và hai trang admin.
- **Data:** working hours và blocked slots được lưu DB qua server action.
- **Business:** bước lưới hiện là 15 phút; buffer và overlap quyết định slot có xuất hiện.

## Cách sửa an toàn

1. Chỉnh giờ mở cửa ở `/admin/schedule` theo dạng `09:00-12:00,13:00-21:00`.
2. Block phải có lý do, end sau start và nằm trong cùng ngày local.
3. Không đổi timezone riêng lẻ; code hiện chuẩn hóa `Asia/Ho_Chi_Minh`.
4. Nếu đổi thuật toán slot, sửa test domain trước rồi mới sửa API/repository.

## Lưu ý

- `PENDING_PAYMENT` chỉ chiếm slot khi hold chưa hết hạn; `PENDING` và `CONFIRMED` luôn chiếm.
- Tạo hold còn kiểm tra DB lần nữa dưới room/date lock; danh sách slot không phải cam kết giữ chỗ.
- `weekday` dùng 0 = Chủ nhật đến 6 = Thứ bảy.

## Xác minh

```bash
npm run test -- src/features/availability
npm run test:integration -- tests/integration/availability-query.test.ts tests/integration/schedule-repository.test.ts
npm run test:e2e -- tests/e2e/admin-schedule.spec.ts tests/e2e/guest-booking.spec.ts
npm run lint && npm run typecheck && npm run build
```
