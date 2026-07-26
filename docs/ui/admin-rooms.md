# UI quản lý phòng studio

## Route và mục đích

`/admin/rooms` tạo/sửa phòng và bật/tắt hiển thị public.

## Bản đồ code

- Route/list/toggle: `src/app/admin/rooms/page.tsx`, `actions.ts`.
- Form: `src/features/studio-room/presentation/room-form.tsx`.
- Validation/manager: `src/features/studio-room/application/room-input.ts`, `manage-room.ts`.
- Repository: `src/features/studio-room/infrastructure/prisma-room-repository.ts`.
- Ảnh theo slug: `src/features/studio-room/presentation/room-visual.tsx`.

## Có thể sửa

- **UI-only:** heading, form card, label, grid/list và message.
- **Data:** name, slug, description, display order, active ghi DB.
- **Ảnh:** admin form không upload ảnh; phải thêm file và mapping thủ công.

## Cách sửa an toàn

1. Giữ input names/register keys khớp `roomInputSchema`.
2. Giữ timezone hidden là `Asia/Ho_Chi_Minh`.
3. Khi thêm phòng/đổi slug, cập nhật `room-visual.tsx`, hero/footer nếu có link và seed/test.
4. Dùng toggle active thay vì xóa record đang có relation.

## Lưu ý

Slug phải kebab-case lowercase và unique. Slug thiếu mapping ảnh dùng poster fallback.

## Xác minh

```bash
npm run test -- src/features/studio-room
npm run test:e2e -- tests/e2e/admin-catalog.spec.ts tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
