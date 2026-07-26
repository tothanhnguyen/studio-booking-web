# Hero trang chủ và media khi cuộn

## Phạm vi

Route `/` dùng canvas desktop để đổi frame theo scroll; mobile hoặc reduced-motion dùng poster/fallback.

## Bản đồ code

- Trang: `src/app/page.tsx`.
- Composition: `src/features/home/presentation/scroll-video-hero.tsx` và các file `hero-*.tsx` cùng thư mục.
- Copy/link phòng: `src/features/home/presentation/hero-copy.ts`.
- Cấu hình ba scene, điểm snap và frame neo: `hero-scroll-state.ts`.
- Số lượng/tên frame và nội suy giữa các scene: `hero-frame-sequence.ts`; loader: `hero-frame-loader.ts`.
- Màu và responsive: `src/styles/hero.css`.
- Media: `public/media/hero-capsules-poster.webp` và `public/media/hero-capsules-sequence/frame-0001.webp`…`frame-0096.webp`.

## Ranh giới thay đổi

- **UI-only:** copy, màu `--hero-*`, kích thước, mask, spacing.
- **Media:** thay frame phải giữ cùng kích thước, thứ tự và tên; hiện tại có 96 file nhưng hero chỉ phát frame 0–56 theo ba scene.
- **Hành vi:** timeline/state/scroll nằm trong `hero-text-motion.tsx`, `hero-scroll-state.ts`, `hero-canvas-sequence.tsx`; sửa cần test animation và reduced-motion.

## Cách sửa an toàn

1. Đổi text/link trong `hero-copy.ts`.
2. Đổi màu nền cả hero ở `--hero-background` và nền hòa viền trong `.hero-atmosphere`.
3. Khi thay frame, xuất đủ 96 WebP, đánh số bốn chữ số liên tục; thay poster riêng.
4. Ba điểm dừng hiện tại nằm trong `HERO_SCENES`: brand `0 → frame 0`, main `0.48 → frame 32`, rooms `1 → frame 56`. Sửa progress hoặc frame ở đây để text, snap và canvas luôn đồng bộ.
5. Frame cuối trong `HERO_SCENES` quyết định phạm vi preload; không cần tải các frame nằm sau điểm đó.
6. Nếu số frame asset khác 96, sửa `HERO_FRAME_COUNT`, kiểm tra URL frame cuối và các frame neo không vượt phạm vi.
7. Không xóa `id="home-hero"`: `shell.css` dựa vào ID này để làm header trong suốt và ẩn footer.

## Lưu ý

- Link/slug phòng còn lặp ở `site-footer.tsx`, `room-visual.tsx` và `prisma/seed.ts`.
- Không thêm animation bắt buộc cho người dùng `prefers-reduced-motion`.
- Hero dùng snap mềm theo riêng section; không thêm CSS scroll-snap toàn trang hoặc khóa wheel/touch.
- `public/media/hero-theme.mp4` tồn tại nhưng hero hiện tại render chuỗi WebP, không phát video đó.

## Xác minh

```bash
find public/media/hero-capsules-sequence -name 'frame-*.webp' | wc -l
npm run test -- src/features/home/presentation
npm run test:e2e -- tests/e2e/home-hero.spec.ts
npm run lint && npm run typecheck && npm run build
```
