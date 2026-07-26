# Theme và layout dùng chung

## Phạm vi

Áp dụng cho mọi route. Riêng hero có token cục bộ và shell đặc biệt khi DOM chứa `#home-hero`.

## Bản đồ code

| Mục | File |
|---|---|
| Màu, radius, motion, content width | `src/styles/tokens.css` |
| Reset, body, focus, reduced motion | `src/styles/base.css` |
| Header, menu mobile, footer, transaction shell | `src/styles/shell.css` |
| Font và root layout | `src/app/layout.tsx` |
| Header/main/footer | `src/components/app-shell.tsx`, `src/components/site-footer.tsx` |
| Thứ tự import CSS | `src/app/globals.css` |

## Ranh giới thay đổi

- **UI-only:** sửa `--color-*`, `--radius-*`, `--content-*`, font, padding hoặc breakpoint.
- **Có hành vi:** sửa selector `:has(#home-hero)` hoặc `[data-page-shell="transaction"]` có thể hiện/ẩn header link, footer và đổi chiều rộng main.
- Link phòng trong header/footer dùng `studioLinks`; đổi slug phải đồng bộ dữ liệu và mapping ảnh.

## Cách sửa an toàn

1. Đổi token semantic trong `tokens.css`; tránh thay từng màu hardcode trên nhiều trang.
2. Kiểm tra tương phản của `--color-text`, `--color-text-muted`, `--color-action` và focus.
3. Nếu sửa shell, kiểm tra `/`, `/studios`, `/booking/<id>` và `/admin` vì ba shell có hành vi khác nhau.
4. Giữ target chạm tối thiểu 44px và `prefers-reduced-motion`.

## Lưu ý

- Hero khai báo `--hero-*` trong `src/styles/hero.css`, không tự động theo toàn bộ `--color-*`.
- `.app-shell:has(#home-hero)` làm header trong suốt, main full-width và ẩn footer.
- Transaction shell được đánh dấu trong `src/app/booking/layout.tsx`.

## Xác minh

```bash
npm run dev
npm run lint && npm run typecheck
npm run test -- src/components/app-shell.test.tsx src/app/layout.test.tsx
npm run build
```

Xem thêm [`home.md`](./home.md) và [`shared-components-and-forms.md`](./shared-components-and-forms.md).
