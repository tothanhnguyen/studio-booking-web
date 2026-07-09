# MowStudio

MowStudio là web booking creative studio bằng tiếng Việt. MVP phục vụ ba không gian: Photo Studio, Voice/Podcast Booth và Music Studio.

Project được xây dựng dưới dạng Next.js modular monolith với service/repository boundary, PostgreSQL transaction, Supabase Auth và SePay/VietQR.

## Yêu cầu

- Node.js 24 LTS
- pnpm 11.9.0 thông qua Corepack
- Docker Desktop và Docker Compose

## Khởi động local

```bash
cp .env.example .env
corepack pnpm install --frozen-lockfile
docker compose -f docker-compose.test.yml up -d --wait
corepack pnpm prisma generate
corepack pnpm prisma migrate deploy
corepack pnpm prisma db seed
corepack pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Quality gate

Lint + typecheck + unit test (không cần DB):

```bash
corepack pnpm ci:verify
```

Integration, E2E và production build cần PostgreSQL test. Export env test DB trước:

```bash
docker compose -f docker-compose.test.yml up -d --wait
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54329/mowstudio_test
export DIRECT_URL=$DATABASE_URL
corepack pnpm prisma migrate deploy
corepack pnpm prisma db seed

corepack pnpm test:integration
corepack pnpm build
```

E2E critical: chạy server và test trong **cùng một shell** (server nền cùng process),
nếu không server production có thể bị OOM-kill khi Playwright tự spawn:

```bash
export ALLOW_TEST_ACTOR=true PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
PORT=3000 corepack pnpm start &        # đợi "Ready", kiểm tra /api/health
corepack pnpm test:e2e:critical
```

CI chạy các job `quality`, `integration`, `e2e-critical` rồi `build`.

## Production release

```bash
# 1. Validate môi trường production
corepack pnpm check:env

# 2. Migrate (tách biệt khỏi app boot, dùng DIRECT_URL non-pooled)
MIGRATION_CONFIRM=production DIRECT_URL=<direct-url> corepack pnpm migrate:production

# 3. Sau deploy: smoke test deployment
corepack pnpm smoke:production https://<deployment-url>
```

- `/api/health` — liveness + release SHA, không phụ thuộc DB.
- `/api/ready` — `SELECT 1` có timeout, trả `503` khi DB outage.

Runbook và quy trình sự cố:

- [`docs/operations/vercel-runbook.md`](docs/operations/vercel-runbook.md)
- [`docs/operations/incident-checklist.md`](docs/operations/incident-checklist.md)

Chi tiết environment và testing nằm tại:

- [`docs/development/environment.md`](docs/development/environment.md)
- [`docs/development/testing.md`](docs/development/testing.md)

Design và implementation plan nằm trong [`docs/superpowers`](docs/superpowers).
