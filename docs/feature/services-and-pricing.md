# Dịch vụ và giá

## Phạm vi

Dịch vụ thuộc một phòng, có loại `ROOM_ONLY`/`ASSISTED`, thời lượng, buffer, giá VND và trạng thái active.

## Bản đồ code

- Public query/card: `src/features/service/application/get-public-service.ts`, `presentation/service-card.tsx`.
- Admin form/validation: `presentation/service-form.tsx`, `application/service-input.ts`.
- Manager/repository: `application/manage-service.ts`, `infrastructure/prisma-service-repository.ts`.
- Trang: `src/app/services/[slug]/page.tsx`, `src/app/admin/services/page.tsx`.
- Dữ liệu mẫu: `prisma/seed.ts`; model: `prisma/schema.prisma`.

## Ranh giới thay đổi

- **UI-only:** cách format giá, label, card và trang chi tiết.
- **Data:** giá, duration, buffer, booking type, active và display order sửa qua admin.
- **Business:** giá/duration/buffer được snapshot vào booking và tham gia kiểm tra slot; không chỉ là text.

## Cách sửa an toàn

1. Với catalog đang chạy, sửa ở `/admin/services`.
2. Giữ `currency="VND"`; schema chỉ chấp nhận VND.
3. Dùng số nguyên dương cho giá/thời lượng, buffer không âm.
4. Nếu đổi slug, cập nhật link ngoài code nếu có; route public dùng slug, route booking dùng `service.id`.
5. Chỉ sửa `prisma/seed.ts` nếu muốn thay dữ liệu seed cho môi trường mới.

## Lưu ý

- Giá đã snapshot trong booking cũ không tự thay khi sửa service.
- Không đổi dòng “cọc 30%” độc lập; backend tính ở `src/lib/money/vnd.ts`.
- Service hoặc room bị inactive sẽ không thể tạo booking mới.

## Xác minh

```bash
npm run test -- src/features/service src/lib/money/vnd.test.ts
npm run test:integration -- tests/integration/catalog-repositories.test.ts
npm run test:e2e -- tests/e2e/admin-catalog.spec.ts tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
