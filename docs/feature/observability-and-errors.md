# Quan sát hệ thống và xử lý lỗi

## Phạm vi

Hệ thống có JSON log đã redact, request ID, Sentry tùy chọn, liveness/readiness và trang lỗi global.

## Bản đồ code

- Logger/redact/context: `src/features/observability/logger.ts`, `redact.ts`, `request-context.ts`.
- Sentry: `sentry-options.ts`, các file `sentry.*.config.ts`, `src/app/global-error.tsx`.
- Probe: `src/app/api/health/route.ts`, `src/app/api/ready/route.ts`, `readiness-check.ts`.
- Production scripts: `scripts/smoke-production.mjs`, `scripts/check-env.ts`.
- Env: `.env.example`.

## Ranh giới thay đổi

- **UI-only:** nội dung/style `global-error.tsx`.
- **Observability:** field log, redaction, request header và Sentry có tác động bảo mật/production.
- `/api/health` không chạm DB; `/api/ready` chạy `SELECT 1` với timeout 2 giây.

## Cách sửa an toàn

1. Log bằng `logger.info/warn/error`, không dùng raw email, phone, token, webhook hoặc bank data.
2. Bọc route mới cần correlation bằng `withRequestContextHandler`.
3. Khi thêm dữ liệu nhạy cảm mới, cập nhật redaction và test trước.
4. Không làm health phụ thuộc DB; dependency check thuộc readiness.

## Lưu ý

- Request ID upstream chỉ được tin khi khớp pattern an toàn, nếu không tạo UUID.
- Sentry tắt khi không có DSN và `sendDefaultPii` là false.
- `NEXT_PUBLIC_RELEASE_SHA`/Vercel SHA giúp nối log với release.

## Xác minh

```bash
npm run test -- src/features/observability src/app/api/health/route.test.ts src/app/api/ready/route.test.ts
npm run test:integration -- tests/integration/request-correlation.test.ts
npm run lint && npm run typecheck && npm run build
```
