# Phòng studio và ảnh

## Phạm vi

Phòng public đến từ database; ảnh phòng được map tĩnh theo slug.

## Bản đồ code

- List/query public: `src/features/studio-room/application/list-public-rooms.ts`.
- Repository: `src/features/studio-room/infrastructure/prisma-room-repository.ts`.
- Card/ảnh/form: `src/features/studio-room/presentation/room-card.tsx`, `room-visual.tsx`, `room-form.tsx`.
- Admin actions: `src/app/admin/rooms/actions.ts`; trang `/admin/rooms`.
- Ảnh: `public/media/rooms/*.webp`; dữ liệu mặc định: `prisma/seed.ts`.

## Ranh giới thay đổi

- **UI-only:** style `.room-*` trong `src/styles/utilities.css`, alt/copy fallback trong component.
- **Data:** tên, mô tả, thứ tự, active, slug nên sửa ở `/admin/rooms`; seed chỉ dùng khởi tạo/dev.
- **Ảnh:** `room-visual.tsx` map chính xác slug → `src` và material.

## Cách sửa an toàn

1. Đổi ảnh nhưng giữ slug: thay đúng file WebP trong `public/media/rooms/`; không cần đổi DB.
2. Thêm phòng mới: tạo qua admin, thêm ảnh và entry vào `roomVisuals`.
3. Nếu đổi slug, đồng bộ `prisma/seed.ts`, `room-visual.tsx`, `hero-copy.ts`, `site-footer.tsx` và test.
4. Giữ timezone `Asia/Ho_Chi_Minh`; schema form không nhận timezone khác.

## Lưu ý

- Slug không có mapping ảnh sẽ dùng `hero-capsules-poster.webp` làm fallback.
- Chỉ phòng active được public query; service public cũng phải active.
- Xóa/đổi slug có thể làm link cũ 404; admin hiện cung cấp bật/tắt, không phải delete.

## Xác minh

```bash
npm run test -- src/features/studio-room
npm run test:integration -- tests/integration/catalog-repositories.test.ts tests/integration/seed.test.ts
npm run test:e2e -- tests/e2e/admin-catalog.spec.ts tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
