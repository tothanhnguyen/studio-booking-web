# Thanh toán SePay và hoàn tiền

## Phạm vi

App tạo VietQR lúc chạy, nhận webhook SePay, đối chiếu số tiền/reference và quản lý refund thủ công theo trạng thái.

## Bản đồ code

- Chính sách cọc: `src/lib/money/vnd.ts`; đánh giá payment: `src/features/payment/application/payment-policy.ts`.
- Provider/QR: `src/features/payment/infrastructure/sepay/`.
- Webhook: `src/app/api/payments/sepay/webhook/route.ts`, `application/process-payment-event.ts`.
- UI: `presentation/vietqr-payment.tsx`, `payment-status.tsx`, route payment/confirmation.
- Refund: `application/update-refund-status.ts`, admin booking actions và `/admin/payments`.

## Ranh giới thay đổi

- **UI-only:** cách trình bày QR, copy, status và summary.
- **Cấu hình:** bank BIN/account/name/prefix/secret đến từ env; QR URL do `img.vietqr.io` tạo.
- **Business:** cọc 30%, cumulative payment, late/overpaid review và refund transition là backend policy.

## Cách sửa an toàn

1. Đổi tài khoản nhận tiền qua env; không hardcode hoặc commit số thật.
2. Giữ transfer content chứa `BOOKING:<uuid>` hoặc đồng bộ cả parser webhook.
3. Nếu đổi tỷ lệ cọc, sửa `calculateDeposit()`, toàn bộ copy “30%” và test; không sửa UI đơn lẻ.
4. Chỉ cho admin cập nhật refund theo chuỗi transition được phép.

## Lưu ý

- Webhook dùng signature khi `SEPAY_WEBHOOK_SECRET` được cấu hình và có idempotency/event uniqueness.
- Underpaid chưa settled; overpaid cần review.
- Refund status không tự chuyển tiền qua ngân hàng; đây là theo dõi vận hành.

## Xác minh

```bash
npm run test -- src/features/payment src/lib/money/vnd.test.ts
npm run test:integration -- tests/integration/payment-webhook.test.ts tests/integration/late-payment.test.ts
npm run test:e2e -- tests/e2e/room-only-payment.spec.ts
npm run lint && npm run typecheck && npm run build
```
