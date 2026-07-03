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
corepack pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Quality gate

```bash
corepack pnpm ci:verify
corepack pnpm test:integration
corepack pnpm build
```

Chi tiết environment và testing nằm tại:

- [`docs/development/environment.md`](docs/development/environment.md)
- [`docs/development/testing.md`](docs/development/testing.md)

Design và implementation plan nằm trong [`docs/superpowers`](docs/superpowers).
