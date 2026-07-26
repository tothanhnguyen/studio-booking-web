# UI trang chủ

## Route và mục đích

`/` giới thiệu thương hiệu bằng hero cuộn, ba trạng thái nội dung và selector Photo/Podcast/Music.

## Bản đồ code

- Route: `src/app/page.tsx`.
- Composition: `src/features/home/presentation/scroll-video-hero.tsx`.
- Copy/link: `src/features/home/presentation/hero-copy.ts`.
- Các state: `hero-brand-state.tsx`, `hero-main-state.tsx`, `hero-room-selector.tsx`.
- Style: `src/styles/hero.css`; media/frame: xem [`../feature/home-hero-and-scroll-media.md`](../feature/home-hero-and-scroll-media.md).

## Có thể sửa

- **UI-only:** headline, eyebrow, CTA, mô tả phòng, màu `--hero-*`, mask và spacing.
- **Ảnh:** thay poster/96 frame đúng quy ước.
- **Không còn UI-only:** sửa progress/state animation, frame count hoặc link slug.

## Cách sửa an toàn

1. Sửa copy trong `hero-copy.ts`, không rải text sang nhiều component.
2. Sửa màu/spacing trong `hero.css`; kiểm tra desktop và mobile.
3. Giữ `id="home-hero"` và `data-scroll-canvas-section`.
4. Muốn đổi frame đẹp tại từng điểm dừng, sửa `frameIndex` của ba scene trong `hero-scroll-state.ts`; không sửa riêng canvas hoặc text timeline.
5. Nếu đổi link phòng, đồng bộ footer, mapping ảnh và seed.

## Lưu ý

`#home-hero` kích hoạt shell đặc biệt: header trong suốt, main full-width, footer ẩn. Reduced-motion không chạy canvas scroll.

## Xác minh

```bash
npm run test -- src/features/home/presentation
npm run test:e2e -- tests/e2e/home-hero.spec.ts
npm run lint && npm run typecheck && npm run build
```
