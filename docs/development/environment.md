# Environment local và CI

## Nguyên tắc

- Không commit `.env` hoặc secret thật.
- `.env.example` chỉ mô tả contract và dùng placeholder.
- Biến `NEXT_PUBLIC_*` được gửi tới browser; không đặt secret dưới prefix này.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ được đọc trong server-only module.
- `DATABASE_URL` dành cho runtime; production dùng Supabase pooled connection.
- `DIRECT_URL` dành cho Prisma migration; production dùng direct connection.

## Thiết lập local

```bash
cp .env.example .env
corepack pnpm check:env
```

PostgreSQL test local dùng `localhost:54329`, database `mowstudio_test`. Các credential trong compose chỉ dành cho test local.

## CI

GitHub Actions dùng giá trị Supabase giả vì Phase 0 chưa gọi Supabase. PostgreSQL integration job dùng service container riêng trên port 5432. Secret production phải được cấu hình trong platform secret store, không ghi vào workflow.
