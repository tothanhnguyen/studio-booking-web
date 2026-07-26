# UI theo dõi payment và refund

## Route và mục đích

`/admin/payments` liệt kê tối đa 100 booking paid hoặc có refund cần đối soát.

## Bản đồ code

- Route/query/layout: `src/app/admin/payments/page.tsx`.
- Link xử lý refund: `/admin/bookings/[id]`.
- Refund policy/action: `src/features/payment/application/update-refund-status.ts`, `src/app/admin/bookings/[id]/actions.ts`.
- Model trạng thái: `prisma/schema.prisma`.
- Theme dùng token và Tailwind trực tiếp trong page.

## Có thể sửa

- **UI-only:** heading, card/list, amount formatting, empty state và label status.
- **Query/data:** điều kiện OR, sort và `take: 100` quyết định những gì xuất hiện.
- **Business:** trang này chỉ theo dõi; cập nhật refund thực hiện ở booking detail.

## Cách sửa an toàn

1. Sửa copy/layout trong page; giữ link booking ID.
2. Nếu thêm filter/pagination, chuyển query theo search params và test repository/query.
3. Không hiển thị raw payload/provider data.
4. Giữ amount theo VND và trạng thái payment/refund rõ bằng chữ.

## Lưu ý

`REFUNDED` không nằm trong filter refund hiện tại trừ khi booking cũng `PAID`; `NONE` paid vẫn được liệt kê.

## Xác minh

```bash
npm run test -- src/features/payment/application/update-refund-status.test.ts
npm run test:e2e -- tests/e2e/room-only-payment.spec.ts tests/e2e/assisted-lifecycle.spec.ts
npm run lint && npm run typecheck && npm run build
```
