# UI đăng nhập

## Route và mục đích

`/login` cung cấp email/password, Google OAuth và link sang đăng ký.

## Bản đồ code

- Route/layout/copy: `src/app/login/page.tsx`.
- Form/state: `src/features/auth/presentation/auth-form.tsx`.
- Server actions: `src/features/auth/application/auth-actions.ts`.
- Theme/form: `src/styles/tokens.css`, `src/styles/forms.css` và Tailwind trực tiếp trong hai file UI.

## Có thể sửa

- **UI-only:** heading, mô tả, label, button copy, width và spacing.
- **Hành vi:** submit, Google form action, redirect `/account/bookings` và error handling.
- **Auth:** validation password tối thiểu 8 ký tự nằm cả UI và server schema.

## Cách sửa an toàn

1. Đổi copy ở page/form; giữ `name="email"`, `name="password"` và autocomplete.
2. Nếu sửa layout, kiểm tra focus/error/loading state.
3. Giữ Google button trong `<form action={signInWithGoogleAction}>`.
4. Không tự nối `next` từ query vào redirect nếu chưa validate open redirect.

## Lưu ý

Login thành công hiện chuyển `/account/bookings`; callback OAuth dùng route `/auth/callback`.

## Xác minh

```bash
npm run test -- src/features/auth
npm run test:e2e -- tests/e2e/auth.spec.ts
npm run lint && npm run typecheck && npm run build
```
