# Xác thực và vai trò

## Phạm vi

Supabase cung cấp email/password và Google OAuth; app chỉ nhận actor có email đã xác minh. Vai trò local là `CUSTOMER` hoặc `ADMIN`.

## Bản đồ code

- Actions/form: `src/features/auth/application/auth-actions.ts`, `presentation/auth-form.tsx`.
- Actor/sync: `application/current-actor.ts`, `sync-user.ts`.
- Guard: `application/require-role.ts`, `admin-page-actor.ts`.
- Callback: `src/app/auth/callback/route.ts`; Supabase clients: `src/lib/supabase/`.
- Admin seed: `scripts/seed-admin.ts`; schema/env: `prisma/schema.prisma`, `.env.example`.

## Ranh giới thay đổi

- **UI-only:** label, layout, error copy ở login/register/form.
- **Auth config:** callback URL, provider và env phải khớp Supabase dashboard.
- **Security:** role guard phải nằm server-side; ẩn link trên UI không cấp hay thu quyền.

## Cách sửa an toàn

1. Giữ redirect callback ở `${APP_URL}/auth/callback` và chỉ cho `next` bắt đầu bằng một `/`.
2. Nếu thêm provider, tạo action server tương tự Google và cấu hình provider bên Supabase.
3. Nếu thêm role, cập nhật Prisma enum, Actor type, guard, migration và mọi nhánh điều hướng.
4. Tạo admin bằng `npm run seed:admin`; không sửa role bằng UI public.

## Lưu ý

- User chưa xác minh email trả về actor null.
- User không phải admin truy cập admin nhận 404; chưa đăng nhập được chuyển tới login với `next`.
- `ALLOW_TEST_ACTOR` chỉ phục vụ test, không bật production.

## Xác minh

```bash
npm run test -- src/features/auth src/lib/env/server.test.ts
npm run test:integration -- tests/integration/user-sync.test.ts
npm run test:e2e -- tests/e2e/auth.spec.ts tests/e2e/admin-denial.spec.ts
npm run lint && npm run typecheck && npm run build
```
