# UI đăng ký

## Route và mục đích

`/register` tạo tài khoản email/password và yêu cầu người dùng xác minh email.

## Bản đồ code

- Route/layout/copy: `src/app/register/page.tsx`.
- Form dùng chung: `src/features/auth/presentation/auth-form.tsx` với `mode="register"`.
- Action/callback URL: `src/features/auth/application/auth-actions.ts`.
- Theme: `src/styles/tokens.css`; field dùng Tailwind trực tiếp trong `auth-form.tsx`.

## Có thể sửa

- **UI-only:** heading, mô tả, label, loading/success copy, spacing.
- **Hành vi:** đăng ký thành công chỉ hiện message kiểm tra email; chưa tự đăng nhập actor chưa verified.
- **Auth:** thay password rule hoặc callback cần sửa server schema và test.

## Cách sửa an toàn

1. Đổi copy page/form, giữ input email/password và `minLength={8}` đồng bộ server.
2. Giữ success message có `role="status"`; lỗi dùng `role="alert"`.
3. Không bỏ bước email verification trong `current-actor.ts`.
4. Kiểm tra link quay lại `/login`.

## Lưu ý

Email redirect dùng `${APP_URL}/auth/callback?next=/account/bookings`; `APP_URL` phải đúng môi trường.

## Xác minh

```bash
npm run test -- src/features/auth src/lib/env/server.test.ts
npm run test:e2e -- tests/e2e/auth.spec.ts
npm run lint && npm run typecheck && npm run build
```
