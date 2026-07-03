# Chiến lược kiểm thử

## Unit/component test

```bash
corepack pnpm test
```

Vitest chạy các file `src/**/*.test.{ts,tsx}` với jsdom và Testing Library.

## PostgreSQL integration test

```bash
docker compose -f docker-compose.test.yml up -d --wait
corepack pnpm test:integration
```

Integration suite chạy trên PostgreSQL 18 thật. Không thay bằng SQLite vì các phase sau cần transaction-level advisory lock và PostgreSQL-specific SQL.

Dừng test database:

```bash
docker compose -f docker-compose.test.yml down -v
```

## E2E

```bash
corepack pnpm test:e2e
```

Phase 0 chỉ thiết lập Playwright runner; E2E scenario bắt đầu từ các phase feature.

## Gate trước commit

```bash
corepack pnpm ci:verify
corepack pnpm test:integration
corepack pnpm build
```
