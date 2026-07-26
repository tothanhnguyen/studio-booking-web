# UI khung giờ bị chặn

## Route và mục đích

`/admin/blocked-slots` liệt kê block theo thời gian Việt Nam và cho phép xóa; block mới được tạo ở `/admin/schedule`.

## Bản đồ code

- Route/list/formatter: `src/app/admin/blocked-slots/page.tsx`.
- Delete/create actions: `src/app/admin/blocked-slots/actions.ts`.
- Repository: `src/features/availability/infrastructure/prisma-schedule-repository.ts`.
- Validation: `src/features/availability/application/manage-schedule.ts`.
- Create UI: `src/features/availability/presentation/schedule-editor.tsx`.

## Có thể sửa

- **UI-only:** card, heading, empty state, date format và delete button style.
- **Data:** delete action xóa block và làm slot khả dụng trở lại nếu không có booking conflict khác.
- **Security:** action phải giữ `requireRole("ADMIN")`.

## Cách sửa an toàn

1. Sửa list card trong route, giữ room name/reason/time.
2. Giữ formatter timezone `Asia/Ho_Chi_Minh`.
3. Nếu thêm confirm xóa, không chuyển quyền xóa ra client không guard.
4. Kiểm tra availability sau khi tạo và xóa block.

## Lưu ý

Trang load tất cả block theo repository hiện tại; chưa có filter/pagination trong UI.

## Xác minh

```bash
npm run test -- src/features/availability
npm run test:integration -- tests/integration/schedule-repository.test.ts
npm run test:e2e -- tests/e2e/admin-schedule.spec.ts
npm run lint && npm run typecheck && npm run build
```
