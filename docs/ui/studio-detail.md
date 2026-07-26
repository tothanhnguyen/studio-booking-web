# UI chi tiết studio

## Route và mục đích

`/studios/[slug]` hiển thị heading, ảnh, số dịch vụ và danh sách dịch vụ của một phòng active.

## Bản đồ code

- Route/metadata/layout: `src/app/studios/[slug]/page.tsx`.
- Heading/empty: `src/components/ui/page-heading.tsx`, `empty-state.tsx`.
- Ảnh: `src/features/studio-room/presentation/room-visual.tsx`.
- Service row: `src/features/service/presentation/service-card.tsx`.
- Style: `.room-portal*`, `.facts-rail`, `.service-list/.service-row*` trong `src/styles/utilities.css`.

## Có thể sửa

- **UI-only:** label “Studio”, heading section, facts rail, bố cục ảnh và service list.
- **Data:** title/description/service count/dịch vụ đến từ DB.
- **Business:** `notFound()` và chỉ tìm phòng active không nên bỏ để “hiện tạm” phòng inactive.

## Cách sửa an toàn

1. Sửa copy cố định trong route; sửa row dịch vụ trong `ServiceCard`.
2. Sửa layout qua `.room-portal*` và breakpoint hiện có.
3. Giữ `aria-labelledby`/heading ID và alt ảnh.
4. Nếu thêm fact từ DB, mở rộng query/type trước khi render.

## Lưu ý

Metadata cũng query phòng theo slug. Slug sai hoặc inactive trả trang not-found.

## Xác minh

```bash
npm run test -- src/features/studio-room src/features/service/presentation/service-card.test.tsx
npm run test:e2e -- tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
