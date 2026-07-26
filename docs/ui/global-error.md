# UI lỗi toàn ứng dụng

## Route và mục đích

`src/app/global-error.tsx` là fallback client-side khi lỗi vượt qua route boundaries; nó render cả `<html>` và `<body>`.

## Bản đồ code

- UI/capture: `src/app/global-error.tsx`.
- Theme: `src/styles/tokens.css` (CSS đã được root layout import trong app bình thường).
- Sentry config/redaction: `src/features/observability/sentry-options.ts`, `redact.ts`.
- Error logging ở API: `src/features/observability/logger.ts`.

## Có thể sửa

- **UI-only:** headline, hướng dẫn, alignment, spacing và màu semantic.
- **Hành vi:** `useEffect` chỉ import/capture Sentry khi có `NEXT_PUBLIC_SENTRY_DSN`.
- Không hiển thị `error.message`, stack, digest hoặc thông tin request cho khách.

## Cách sửa an toàn

1. Giữ file có `"use client"` và giữ `<html lang="vi"><body>`.
2. Chỉ dùng copy chung, không phản chiếu nội dung error.
3. Nếu thêm nút thử lại, xác định rõ reload hay reset boundary và thêm test.
4. Kiểm tra trang vẫn đọc được nếu asset/font phụ thất bại.

## Lưu ý

Đây không phải 404/not-found. Health/readiness API có response riêng và không dùng UI này.

## Xác minh

```bash
npm run test -- src/features/observability
npm run lint && npm run typecheck && npm run build
```
