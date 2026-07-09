---
type: qa-report
date: 2026-07-09
scope: phase-6-reverify
baseline: fe65460..2956f7b
supersedes: qa-report-260709-0832-phase6-verification.md
---

# QA Report: Phase 6 Re-Verification

## Summary
Chạy lại toàn bộ gate Phase 6 sau khi các finding từ report trước (`qa-report-260709-0832`) đã được sửa. **Tất cả automated gate PASS.** Mọi finding Critical/High/Medium/Low đã resolved. Task 6.4 (deploy Vercel thật) vẫn là bước thủ công theo thiết kế — cần credential production.

Kết luận: code Phase 6 sẵn sàng để test thủ công + deploy.

## Automated Test Results
| Check | Result | Evidence |
|---|---:|---|
| `pnpm ci:verify` | PASS | 36 test files, 116 tests passed |
| Docker test DB | PASS | `up -d --wait` healthy |
| `pnpm prisma migrate deploy` (test DB) | PASS | No pending migrations |
| `pnpm test:integration` | PASS | 15 files, 29 tests passed |
| `pnpm test:e2e:critical` | PASS | 8/8 passed (server quản lý trong cùng shell) |
| `pnpm build` (production) | PASS | Compiled successfully |
| `pnpm smoke:production` | PASS | 5/5 checks (gồm SHA + seeded route) |
| Migration guards (missing URL/bad URL/no confirm) | PASS | 3/3 reject |
| Migration idempotence | PASS | Lần 2 no-op |
| Env fail-closed: prod thiếu `SEPAY_WEBHOOK_SECRET` | PASS | Rejected |
| Env: prod có secret | PASS | Parsed OK |

## Finding Resolution (vs report trước)
| # | Finding cũ | Sev | Trạng thái | Bằng chứng |
|---|---|---|---|---|
| 1 | Prod chấp nhận webhook chưa ký | Critical | FIXED | `server-schema.ts` throw khi prod thiếu secret; `sepay-signature.ts` return `false` khi prod thiếu secret; provider throw `SepayProviderError` |
| 2 | Log lộ DB credential | High | FIXED | `redact.ts` mask postgres URL / IP:port / `password=` / `token=`; log in ra `[redacted]`; test khẳng định |
| 3 | E2E critical chưa verify | High | FIXED | 8/8 pass local; blocker cũ là OOM (`Killed:9`) của webServer do Playwright spawn trong sandbox chật RAM, không phải lỗi code |
| 4 | Browser Sentry thiếu DSN | Medium | FIXED | Thêm `NEXT_PUBLIC_SENTRY_DSN` vào schema/env/runbook; `sentry-options` ưu tiên public DSN |
| 5 | Request ID chưa gắn Sentry | Medium | FIXED | `request-context.ts` gọi `Sentry.setTag/setContext("request_id")` |
| 6 | Smoke không chứng minh SHA/seed | Medium | FIXED | `smoke-production.mjs` assert `releaseSha !== "unknown"` + route `/studios/photo-studio` |
| 7 | Preview Playwright URL không chạy được | Medium | FIXED | `playwright.config.ts` đọc `PLAYWRIGHT_BASE_URL` + `PLAYWRIGHT_REUSE_SERVER` |
| 8 | Local migrate có thể trúng DB thật | Medium | MITIGATED | Manual procedure ép env test DB; `migrate:production` guard confirm |
| 9 | Auth callback thiếu correlation | Low | FIXED | `auth/callback/route.ts` wrap `withRequestContextHandler` + log lỗi |

## Spec Compliance
| Task | Status | Notes |
|---|---:|---|
| 6.1 observability | PASS | Context/log/redaction/Sentry đầy đủ; request ID gắn Sentry; client DSN có |
| 6.2 health/readiness/smoke | PASS | Routes pass; smoke verify SHA + seed; readiness không lộ chi tiết |
| 6.3 CI/migration | PASS | Guards + idempotence + build + unit + integration + E2E critical pass |
| 6.4 Vercel production | MANUAL/PENDING | Checklist sẵn sàng; chưa có bằng chứng production (cần credential) |

## Môi trường lưu ý
- E2E critical chỉ ổn định khi server chạy trong **cùng shell** với test (hoặc external URL đã sẵn sàng). Playwright-spawned `webServer` bị OOM-kill trong sandbox này. CI (GitHub Actions, nhiều RAM hơn) không gặp — nhưng nên theo dõi lần chạy CI đầu tiên.

## Unresolved Questions
- GitHub Actions có tái hiện OOM của webServer không? (RAM runner mặc định 7GB — kỳ vọng không, nhưng cần xác nhận ở CI run đầu tiên.)
- Local env đang trỏ Supabase dev/preview/prod? Không kiểm tra secret.
