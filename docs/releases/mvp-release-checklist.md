# MVP Production Release Checklist — MowStudio (Vercel)

Bằng chứng phát hành MVP lên Vercel. Điền các ô và giá trị khi thực thi. Đây là **bước thủ công** vì cần credential và quyền truy cập account thật.

> Tham chiếu: [`docs/operations/vercel-runbook.md`](../operations/vercel-runbook.md), [`docs/operations/incident-checklist.md`](../operations/incident-checklist.md).

## 0. Tiền đề

- [ ] Gate Phase 5 đã xanh (payment, lifecycle, notification E2E pass).
- [ ] Phase 6 Task 6.1–6.3 đã merge (`feat: add production observability`, `feat: add health and readiness probes`, `ci: complete release quality gates`).
- [ ] CI đầy đủ (`quality`, `integration`, `e2e-critical`, `build`) xanh trên commit sẽ deploy.

## 1. Cấu hình tài nguyên production

- [x] **Vercel project** đã link với repo: `thanhnguyen313s-projects/studio-booking-web`.
  Branch production cần xác nhận trong Vercel trước promote.
- [x] **Supabase production project** tạo xong; migration production schema `public` up to date.
- [ ] **Sentry project** tạo xong; lấy `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, set `SENTRY_ENVIRONMENT=production`.
- [ ] Nhập đủ env production vào Vercel (Production scope) theo bảng trong runbook. KHÔNG commit secret.
  Hiện Production scope chưa có env; Preview đã được nạp và dùng schema `mowstudio_preview`.
- [ ] Xác minh Supabase **redirect URLs** trỏ về domain production (login/register/callback).
- [ ] Xác minh **Google OAuth** callback URL khớp domain production.
- [ ] Xác minh **SePay webhook URL** = `https://<domain>/api/payments/sepay/webhook` và `SEPAY_WEBHOOK_SECRET` đã set.
- [x] Nếu phát hành bản demo: `PAYMENT_MODE=demo`; không cấu hình webhook SePay thật,
  admin xác nhận tiền cọc từ trang chi tiết booking.
- [ ] Xác minh **email sender domain** (Resend) đã verify.

## 2. Preview deployment

- [x] Deploy Preview với dữ liệu phi production: `mowstudio_preview` schema.
- [x] Smoke Preview:
  `https://studio-booking-ehi0sd71c-thanhnguyen313s-projects.vercel.app`
  — `/api/health` 200, `/api/ready` 200, public routes 200, `/admin` anonymous 307.
- [ ] Critical Playwright chạy trên Preview → PASS.

## 3. Migration production

- [ ] `pnpm check:production` (production env) → valid.
  Hiện bị chặn đúng vì chưa có `SEPAY_WEBHOOK_SECRET`, Resend và Sentry credentials.
- [ ] `MIGRATION_CONFIRM=production DIRECT_URL=<direct> pnpm migrate:production` → applied.
  - SHA commit: `__________`
  - Migration version áp dụng: `__________`

## 4. Deploy + verify production

- [ ] Promote/deploy đúng SHA đã review (SHA invariant với bước migrate).
  - Deployment URL: `__________`
  - Release SHA (từ `/api/health`): `__________`
- [ ] `pnpm smoke:production https://<domain>` → PASS. Kết quả: `__________`
- [ ] Chạy một payment low-value / chế độ test có kiểm soát → booking chuyển state đúng.
- [ ] Xác nhận **request correlation**: một request ID trace xuyên log/Sentry.
- [ ] Xác nhận **không có PII** trong log/telemetry (email/phone/token/webhook đã redact).
- [ ] Sentry nhận được **release event** gắn đúng SHA.

## 5. Monitoring & rollback

- [ ] Uptime monitor cấu hình cho `/api/health` và homepage.
- [ ] Thủ tục rollback đã document (runbook mục "Quyết định rollback").
- [ ] Ghi lại: CI run link `__________`, ngày phát hành `__________`.

## Gate Phase 6

- [ ] MowStudio live trên Vercel; CI đầy đủ; migration/health/readiness/Sentry/log/uptime/release SHA và các hành trình quan trọng đã có bằng chứng.

## Ghi chú bảo mật

Trong quá trình cấu hình Preview, database URL đã từng xuất hiện trong output chẩn
đoán cục bộ. Trước khi nạp Production hoặc promote deployment, bắt buộc rotate
database password trên Supabase và cập nhật lại cả `.env` lẫn Vercel.
