---
type: qa-report
date: 2026-07-09
scope: phase-6
baseline: fe65460..9a99666
---

# QA Report: Phase 6 Verification

## Summary
Phase 6 code tasks 6.1-6.3 mostly compile and pass unit, integration, production build, and smoke gates. Production/manual Task 6.4 is still not complete by design; needs real Vercel/Supabase/Sentry credentials and evidence.

Found blockers before production: unsigned SePay webhook can be accepted if production secret missing, logs can leak DB credential text, and critical E2E gate did not run locally because web server exits/killed before tests.

## Scope
- Branch: `tnguyen/phase5`
- Phase 6 commits: `1ff6bf7`, `185ca72`, `c73fbc6`, `526fff2`, `9a99666`
- Diff reviewed: `fe65460..HEAD`
- Changed files: 33 files, 2274 insertions, 64 deletions
- Dirty worktree before report: untracked `CLAUDE-CODE-CLI.command`; not touched

## Automated Test Results
| Check | Result | Evidence |
|---|---:|---|
| `pnpm install --frozen-lockfile` | PASS | Already up to date |
| `pnpm check:env` | PASS | Env schema parses local env |
| `pnpm ci:verify` | PASS | 33 test files, 108 tests passed |
| Docker test DB startup | PASS | `docker compose ... up -d --wait` healthy after Docker Desktop started |
| Prisma migrate to explicit test DB | PASS | Initial migration applied |
| `pnpm test:integration` with explicit test DB env | PASS | 15 files, 29 tests passed |
| `scripts/migrate-production.mjs` guard: missing URL | PASS | Fails as expected |
| migration guard: invalid URL | PASS | Fails as expected |
| migration guard: missing confirm | PASS | Fails as expected |
| migration idempotence on test DB | PASS | `No pending migrations` twice |
| `pnpm prisma db seed` with explicit test DB env | PASS | Seed executed |
| `pnpm build` with explicit test DB env | PASS | Next production build compiled |
| `pnpm smoke:production http://127.0.0.1:3001` | PASS | 4/4 checks pass when server kept in same shell |
| `pnpm test:e2e:critical` | FAIL/BLOCKED | Playwright webServer exits before tests |
| Coverage | NOT RUN | No coverage script/provider configured |

## Findings
### Critical: Production can accept unsigned SePay webhooks
- Evidence: `src/lib/env/server-schema.ts:14` makes `SEPAY_WEBHOOK_SECRET` optional. `src/features/payment/infrastructure/sepay/sepay-signature.ts:8` returns `true` when secret missing.
- Repro: `NODE_ENV=production ... SEPAY_WEBHOOK_SECRET= pnpm check:env` still passes.
- Impact: If production env misses the secret, anyone can POST a forged SePay webhook and potentially settle bookings.
- Recommendation: Fail closed. Require `SEPAY_WEBHOOK_SECRET` for `NODE_ENV=production` or `VERCEL_ENV=production`, and make provider reject unsigned webhook in production.

### High: Readiness/log redaction can leak DB details
- Evidence: `src/app/api/ready/route.ts:19` logs `String(error)` under `cause`. `src/features/observability/redact.ts:18` only masks email/phone in free text.
- Repro output from `pnpm ci:verify`: readiness test log printed DB IP and `password=secret`.
- Impact: Real connection strings/password fragments can reach stdout, Vercel logs, or log drains.
- Recommendation: Log safe error class/code only; extend redaction for `password=...`, connection URLs, tokens in free text; add test asserting logs do not contain DB host/password.

### High: Critical E2E gate not verified locally
- Evidence: `pnpm test:e2e:critical` failed before tests: Playwright `config.webServer` exited early. Direct `pnpm dev` prints Ready then exits code 0 in this environment.
- Second attempt: production server got `Killed: 9` when Playwright started; no app flow executed.
- Impact: CI `e2e-critical` may be red if same webServer behavior happens on GitHub Actions. Local QA cannot prove guest booking/payment/admin-denial flows.
- Recommendation: Diagnose `next dev` lifecycle in CI/local. Consider Playwright webServer using production start, or make config support an externally managed server reliably.

### Medium: Browser Sentry likely disabled/misconfigured
- Evidence: `src/features/observability/sentry-options.ts:11` reads `SENTRY_DSN ?? NEXT_PUBLIC_SENTRY_DSN`. Docs/env/runbook only list `SENTRY_DSN`; no `NEXT_PUBLIC_SENTRY_DSN`.
- Next.js docs confirm non-`NEXT_PUBLIC_` env vars are not available in browser bundles.
- Impact: Server Sentry can work, but client/browser Sentry likely has no DSN. Client release may also miss SHA unless `NEXT_PUBLIC_RELEASE_SHA` is explicitly set.
- Recommendation: Add/document `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_RELEASE_SHA`, or split server/client Sentry options.

### Medium: Request ID not attached to Sentry scope
- Evidence: Search found no `Sentry.setTag`, `setContext`, `configureScope`, or scope update for `requestId`.
- Impact: Logs and responses carry request ID, but Sentry events may not be searchable by generated request ID. Checklist item "trace xuyên log/Sentry" is not proven.
- Recommendation: In request context wrapper, set Sentry tag/context for `requestId`; add a unit/integration test around Sentry scope if feasible.

### Medium: Smoke script does not prove release SHA or seeded public route
- Evidence: `scripts/smoke-production.mjs:14-19` checks `/api/health`, `/api/ready`, `/`, `/studios` only. Health assertion only checks `status === "ok"`.
- Impact: Smoke passes even if `/api/health.releaseSha` is `"unknown"` and seeded detail routes are broken.
- Recommendation: Assert `releaseSha` exists and is not `unknown`; include a known seeded route such as `/studios/photo-studio` or `/services/photo-room-rental`.

### Medium: Preview critical Playwright procedure is not executable as documented
- Evidence: `playwright.config.ts:6` hardcodes `baseURL: "http://127.0.0.1:3000"` and config does not read a deployment URL env.
- Impact: Release checklist says run critical Playwright on Preview URL, but current config targets local only.
- Recommendation: Read `PLAYWRIGHT_BASE_URL`/`BASE_URL` from env and set `PLAYWRIGHT_REUSE_SERVER=true` for hosted preview runs.

### Medium: Local migration command can touch real env DB
- Evidence: Running plain `pnpm prisma migrate deploy` read local env and attempted a Supabase host instead of Docker test DB.
- Impact: Developer can accidentally run migration against non-test DB when following local commands.
- Recommendation: Document explicit test env prefix, add a dedicated test env file, or wrap local integration commands in scripts that force Docker DB URLs.

### Low: Auth callback route lacks request correlation
- Evidence: `src/app/auth/callback/route.ts` is an external route handler but is not wrapped with `withRequestContextHandler`.
- Impact: Auth callback failures are harder to correlate than availability/payment routes.
- Recommendation: Wrap callback route or document scope intentionally excludes it.

## Spec Compliance
| Task | Status | Notes |
|---|---:|---|
| 6.1 request context/logging/Sentry | PARTIAL | Logs/request IDs exist; Sentry context and client DSN gaps remain; log redaction leak blocks production |
| 6.2 health/readiness/smoke | PARTIAL | Routes pass tests; smoke passes locally; smoke does not verify SHA/seed detail; readiness log leaks details |
| 6.3 CI/migration workflow | PARTIAL | Migration guards pass; build, unit, and integration pass; E2E critical not verified; Preview Playwright URL not supported |
| 6.4 Vercel production verification | MANUAL/PENDING | Checklist exists; no production evidence filled yet |

## Manual Test Procedure
1. Fix or consciously accept the Critical/High findings before production.
2. Start Docker Desktop, then run local DB gate with explicit env:
   ```bash
   docker compose -f docker-compose.test.yml up -d --wait
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test pnpm prisma migrate deploy
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test pnpm test:integration
   ```
3. Run local production smoke:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test pnpm build
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test PORT=3000 pnpm start
   pnpm smoke:production http://127.0.0.1:3000
   ```
4. For Preview deployment: set non-production Supabase/Vercel/Sentry env, deploy Preview, run `pnpm smoke:production https://<preview-url>`. Critical Playwright needs config support for external base URL before it can run against Preview cleanly.
5. Before production migration: manually verify Vercel Production env includes `SEPAY_WEBHOOK_SECRET`, Supabase redirect URLs, Google OAuth callback, SePay webhook URL, email sender domain, Sentry env.
6. Run guarded migration:
   ```bash
   MIGRATION_CONFIRM=production DIRECT_URL=<production-direct-url> pnpm migrate:production
   ```
7. Deploy/promote exactly the reviewed SHA. Check:
   ```bash
   curl https://<domain>/api/health
   curl https://<domain>/api/ready
   pnpm smoke:production https://<domain>
   ```
   Confirm health `releaseSha` matches deploy SHA and is not `unknown`.
8. Run one controlled low-value/test payment lifecycle. Verify booking/payment states, request ID in response/log, no PII in logs, and Sentry release event tied to same SHA/request.
9. Configure uptime monitor for `/api/health` and homepage. Record evidence in `docs/releases/mvp-release-checklist.md`.

## Unresolved Questions
- Does GitHub Actions reproduce the local `next dev` early-exit E2E failure?
- Is current local env pointing to dev, preview, or production Supabase? I did not inspect secrets.
- Should I fix the Critical/High issues now, or only report this pass?
