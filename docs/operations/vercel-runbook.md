# Vercel Runbook — MowStudio

Vận hành MowStudio trên Vercel: cấu hình môi trường, migration production và quyết định rollback.

## Môi trường

Ba scope Vercel: **Development**, **Preview**, **Production**. Mỗi scope cần đủ khóa trong hợp đồng env (xem `docs/development/environment.md` và `.env.example`).

| Khóa | Ghi chú |
| --- | --- |
| `DATABASE_URL` | Supabase pooler (pgBouncer), dùng cho runtime. |
| `DIRECT_URL` | Kết nối trực tiếp (non-pooled), CHỈ dùng cho migration. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public browser config. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, không bao giờ prefix `NEXT_PUBLIC_`. |
| `APP_URL` | Origin chính thức. Có thể bỏ trống trên Vercel để dùng `VERCEL_URL`; nên set domain canonical ở Production. |
| `PAYMENT_MODE` | `demo` cho bản trình diễn (không cần webhook thật); `sepay` khi bật thanh toán thật. |
| `SEPAY_*` | Cấu hình VietQR/webhook; chỉ bắt buộc khi `PAYMENT_MODE=sepay`. |
| `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` | Email provider. |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENVIRONMENT` | Observability; public DSN dùng cho browser, để trống nếu tắt Sentry. |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Chỉ build-time, upload source map. |
| `NEXT_PUBLIC_RELEASE_SHA` | Vercel tự set qua `VERCEL_GIT_COMMIT_SHA`; dùng cho release correlation. |

Secret production KHÔNG bao giờ nhập vào `.env.example` hoặc commit vào repo.

Trước khi link/deploy, production phải qua gate nghiêm ngặt:

```bash
corepack pnpm check:production
```

Gate này kiểm tra HTTPS origin, Supabase pooler/direct đúng vai trò, cấu hình SePay
(nếu bật thanh toán thật), Resend sender, Sentry DSN/source-map credentials, đồng
thời cấm `ALLOW_TEST_ACTOR=true`. Vercel chạy cùng contract tự động qua
`check:deploy`.

## Database: pooled vs direct

- Runtime app dùng `DATABASE_URL` (pooler) — chịu tải concurrent tốt.
- Migration dùng `DIRECT_URL` — pgBouncer không hỗ trợ prepared statement của migration.
- Migration TÁCH BIỆT khỏi app boot: chạy trước khi deploy, không chạy khi container khởi động.

## Quy trình phát hành production

Chạy tuần tự, dừng ngay khi có bước thất bại:

1. **Validate env** — `pnpm check:production` với môi trường production.
2. **Migrate** — `MIGRATION_CONFIRM=production DIRECT_URL=<direct> pnpm migrate:production`.
   Script từ chối nếu thiếu `DIRECT_URL` hoặc không có confirm.
3. **Deploy** — deploy đúng SHA đã review (SHA invariant giữa migrate và deploy).
4. **Smoke** — `pnpm smoke:production <deployment-url>`.
5. **Tag release** — Sentry release tự gắn theo `VERCEL_GIT_COMMIT_SHA`.

## Preview deployment

- Mỗi PR tạo một Preview deployment với dữ liệu phi production.
- Chạy smoke + critical Playwright trên Preview URL trước khi promote.
- Preview KHÔNG dùng chung database với Production.
- Preview có thể bỏ `APP_URL`; callback auth tự dùng system env `VERCEL_URL`.
- Với bản demo, đặt `PAYMENT_MODE=demo`; admin xác nhận tiền cọc từ trang chi tiết
  booking và không cần tạo webhook SePay.

## Quyết định rollback

Rollback khi: smoke thất bại, readiness `503` kéo dài, lỗi payment/booking tăng đột biến trong Sentry, hoặc migration gây incident.

Cách rollback:

1. **App-only** (không đổi schema): Vercel → Deployments → chọn deployment SHA trước đó → **Promote to Production**. Nhanh, không mất dữ liệu.
2. **Có migration**: rollback app trước, sau đó đánh giá migration. Migration là forward-only; muốn revert schema phải viết migration bù (không dùng `migrate reset` trên production).

Sau rollback: xác nhận `/api/health` trả về SHA mong đợi, `/api/ready` trả `200`, và smoke pass.

Xem thêm `docs/operations/incident-checklist.md`.
