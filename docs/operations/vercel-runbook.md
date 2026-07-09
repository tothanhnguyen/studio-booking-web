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
| `APP_URL` | Origin chính thức của scope. |
| `SEPAY_*` | Cấu hình VietQR/webhook; `SEPAY_WEBHOOK_SECRET` bắt buộc ở production. |
| `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` | Email provider. |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENVIRONMENT` | Observability; public DSN dùng cho browser, để trống nếu tắt Sentry. |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Chỉ build-time, upload source map. |
| `NEXT_PUBLIC_RELEASE_SHA` | Vercel tự set qua `VERCEL_GIT_COMMIT_SHA`; dùng cho release correlation. |

Secret production KHÔNG bao giờ nhập vào `.env.example` hoặc commit vào repo.

## Database: pooled vs direct

- Runtime app dùng `DATABASE_URL` (pooler) — chịu tải concurrent tốt.
- Migration dùng `DIRECT_URL` — pgBouncer không hỗ trợ prepared statement của migration.
- Migration TÁCH BIỆT khỏi app boot: chạy trước khi deploy, không chạy khi container khởi động.

## Quy trình phát hành production

Chạy tuần tự, dừng ngay khi có bước thất bại:

1. **Validate env** — `pnpm check:env` với môi trường production.
2. **Migrate** — `MIGRATION_CONFIRM=production DIRECT_URL=<direct> pnpm migrate:production`.
   Script từ chối nếu thiếu `DIRECT_URL` hoặc không có confirm.
3. **Deploy** — deploy đúng SHA đã review (SHA invariant giữa migrate và deploy).
4. **Smoke** — `pnpm smoke:production <deployment-url>`.
5. **Tag release** — Sentry release tự gắn theo `VERCEL_GIT_COMMIT_SHA`.

## Preview deployment

- Mỗi PR tạo một Preview deployment với dữ liệu phi production.
- Chạy smoke + critical Playwright trên Preview URL trước khi promote.
- Preview KHÔNG dùng chung database với Production.

## Quyết định rollback

Rollback khi: smoke thất bại, readiness `503` kéo dài, lỗi payment/booking tăng đột biến trong Sentry, hoặc migration gây incident.

Cách rollback:

1. **App-only** (không đổi schema): Vercel → Deployments → chọn deployment SHA trước đó → **Promote to Production**. Nhanh, không mất dữ liệu.
2. **Có migration**: rollback app trước, sau đó đánh giá migration. Migration là forward-only; muốn revert schema phải viết migration bù (không dùng `migrate reset` trên production).

Sau rollback: xác nhận `/api/health` trả về SHA mong đợi, `/api/ready` trả `200`, và smoke pass.

Xem thêm `docs/operations/incident-checklist.md`.
