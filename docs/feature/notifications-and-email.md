# Notification và email

## Phạm vi

Các sự kiện booking tạo notification log idempotent rồi gửi email qua Resend.

## Bản đồ code

- Service/intents: `src/features/notification/application/notification-service.ts`.
- Provider interface/Resend: `application/email-provider.ts`, `infrastructure/resend-email-provider.ts`.
- Copy/template HTML: `presentation/email-templates.tsx`.
- Model/event enum: `prisma/schema.prisma` (`NotificationLog`, `NotificationEventType`).
- Điểm gọi: booking create/cancel/confirm và payment repository.

## Ranh giới thay đổi

- **UI/copy email:** subject và HTML template; vẫn phải escape dữ liệu người dùng.
- **Data:** log lưu email đã mask + hash, status, attempt và causal event; không lưu raw provider payload.
- **Business:** cặp booking + event type + causal event tạo idempotency.

## Cách sửa an toàn

1. Thêm event: cập nhật Prisma enum/migration, `eventTitle` và nơi phát intent.
2. Giữ `escapeHtml()` cho name/service/time đưa vào HTML.
3. Cấu hình `RESEND_API_KEY` và `NOTIFICATION_FROM_EMAIL` qua env.
4. Giữ lỗi provider ở `FAILED`; việc gửi lỗi không được làm mất booking đã tạo.

## Lưu ý

- Notification hiện gửi đồng bộ sau use case; log duplicate được bỏ qua bằng unique constraint.
- Recipient hiển thị trong log đã mask; recipient hash dùng kiểm tra mà không lộ email.
- Không có trang admin retry notification trong code hiện tại.

## Xác minh

```bash
npm run test -- src/features/notification
npm run test:integration -- tests/integration/notification-idempotency.test.ts
npm run lint && npm run typecheck && npm run build
```
