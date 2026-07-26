# UI danh sách studio

## Route và mục đích

`/studios` hiển thị các phòng active theo thứ tự DB, kèm ảnh, số dịch vụ và link chi tiết.

## Bản đồ code

- Route/copy heading: `src/app/studios/page.tsx`.
- Card: `src/features/studio-room/presentation/room-card.tsx`.
- Ảnh: `src/features/studio-room/presentation/room-visual.tsx`.
- Query: `src/features/studio-room/application/list-public-rooms.ts`.
- Style: block `.studios-atlas`, `.room-atlas*`, `.room-visual` trong `src/styles/utilities.css`.

## Có thể sửa

- **UI-only:** PageHeading, empty copy, thứ tự visual/copy, card spacing và button style.
- **Ảnh:** thay file/mapping theo [`../feature/studio-rooms-and-images.md`](../feature/studio-rooms-and-images.md).
- **Data:** tên, mô tả, active, thứ tự và số service đến từ DB/admin.

## Cách sửa an toàn

1. Sửa intro ở route; sửa nội dung lặp của từng row ở `RoomCard`.
2. Sửa layout bằng selector `.room-atlas*` thay vì Tailwind trong nhiều file.
3. Giữ link `/studios/${room.slug}` và alt có tên phòng.
4. Muốn đổi thứ tự phòng, dùng `displayOrder` trong `/admin/rooms`.

## Lưu ý

Page dùng `dynamic = "force-dynamic"`; không biến dữ liệu DB thành copy tĩnh trong component.

## Xác minh

```bash
npm run test -- src/features/studio-room/presentation/room-card.test.tsx src/features/studio-room/presentation/room-visual.test.tsx
npm run test:e2e -- tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
