# UI chi tiết dịch vụ

## Route và mục đích

`/services/[slug]` trình bày loại booking, thời lượng, buffer, giá và CTA sang booking bằng service ID.

## Bản đồ code

- Route/format/copy: `src/app/services/[slug]/page.tsx`.
- Query: `src/features/service/application/get-public-service.ts`.
- Button: `src/components/ui/action.ts`.
- Style: `.service-sheet*` trong `src/styles/utilities.css`.

## Có thể sửa

- **UI-only:** intro fallback, label loại hình, thứ tự facts, CTA copy và layout.
- **Data:** name, description, duration, buffer, price, booking type đến từ DB/admin.
- **Business:** CTA phải giữ `/booking/${service.id}`; `[id]` ở bước này không phải slug.

## Cách sửa an toàn

1. Sửa copy/layout ở route và `.service-sheet*`.
2. Giữ format `Intl.NumberFormat("vi-VN", { currency: "VND" })`.
3. Muốn đổi giá/thời lượng, sửa tại `/admin/services`.
4. Không sửa riêng dòng “Cọc 30%”; xem policy payment.

## Lưu ý

Service hoặc room inactive trả 404. Đổi `bookingType` làm thay đổi lifecycle sau payment.

## Xác minh

```bash
npm run test -- src/features/service src/lib/money/vnd.test.ts
npm run test:e2e -- tests/e2e/public-catalog.spec.ts
npm run lint && npm run typecheck && npm run build
```
