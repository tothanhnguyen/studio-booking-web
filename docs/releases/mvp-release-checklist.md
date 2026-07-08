# MVP Production Release Checklist — MowStudio (Vercel)

Bằng chứng phát hành MVP lên Vercel. Điền các ô và giá trị khi thực thi. Đây là **bước thủ công** vì cần credential và quyền truy cập account thật.

> Tham chiếu: [`docs/operations/vercel-runbook.md`](../operations/vercel-runbook.md), [`docs/operations/incident-checklist.md`](../operations/incident-checklist.md).

## 0. Tiền đề

- [ ] Gate Phase 5 đã xanh (payment, lifecycle, notification E2E pass).
- [ ] Phase 6 Task 6.1–6.3 đã merge (`feat: add production observability`, `feat: add health and readiness probes`, `ci: complete release quality gates`).
- [ ] CI đầy đủ (`quality`, `integration`, `e2e-critical`, `build`) xanh trên commit sẽ deploy.

## 1. Cấu hình tài nguyên production

- [ ] **Vercel project** đã link với repo; branch production = `main`.
- [ ] **Supabase production project** tạo xong; lấy `DATABASE_URL` (pooler) và `DIRECT_URL` (direct).
- [ ] **Sentry project** tạo xong; lấy `SENTRY_DSN`, set `SENTRY_ENVIRONMENT=production`.
- [ ] Nhập đủ env production vào Vercel (Production scope) theo bảng trong runbook. KHÔNG commit secret.
- [ ] Xác minh Supabase **redirect URLs** trỏ về domain production (login/register/callback).
- [ ] Xác minh **Google OAuth** callback URL khớp domain production.
- [ ] Xác minh **SePay webhook URL** = `https://<domain>/api/payments/sepay/webhook` và `SEPAY_WEBHOOK_SECRET` đã set.
- [ ] Xác minh **email sender domain** (Resend) đã verify.

## 2. Preview deployment

- [ ] Deploy Preview với dữ liệu phi production (giống production về cấu trúc).
- [ ] `pnpm smoke:production https://<preview-url>` → PASS.  Kết quả: `__________`
- [ ] Critical Playwright chạy trên Preview → PASS.

## 3. Migration production

- [ ] `pnpm check:env` (production env) → valid.
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
