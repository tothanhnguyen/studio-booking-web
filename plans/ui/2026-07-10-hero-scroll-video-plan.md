# Hero Canvas Image Sequence Plan

## Context

Hero dùng visual ba room capsule từ `public/media/hero-theme.mp4`. Phương án video scrub bằng `video.currentTime` bị hủy hoàn toàn. Source of truth visual: [`design.png`](./design.png).

## Decisions

- Desktop/tablet từ 768px: WebP image sequence render vào `<canvas>`.
- Sequence: 96 frame, lấy đoạn 2s–10s ở 12fps; crop vùng visual và xuất 1440×1080.
- ScrollTrigger chỉ trả progress; `frame = round(progress * 95)` và draw trực tiếp.
- Hero desktop pin bằng sticky section `300vh` (range yêu cầu 250–350vh).
- Preload theo batch 12 frame: nhóm đầu trước, các nhóm sau progressive; frame đang cần được ưu tiên.
- Canvas nằm trên poster fallback; chỉ hiện sau khi frame đầu draw thành công.
- Mobile dưới 768px: chỉ poster tĩnh, không render canvas, không tạo `Image` sequence, không pin dài.
- Reduced motion: poster tĩnh trên mọi viewport; không canvas, không ScrollTrigger, không animation nặng.
- Copy, CTA, chips và trust line là HTML; animation controller riêng dùng opacity, translateY và stagger.
- Không còn `<video>`, autoplay, `currentTime`, responsive video source hay video preload.

## Architecture

```text
ScrollVideoHero (server shell)
├── HTML content (left)
│   └── HeroTextMotion (client controller, no rendered UI)
└── HeroCanvasSequence (right)
    ├── poster (SSR fallback)
    └── desktop-only canvas
        ├── ScrollTrigger progress -> frame index
        ├── progressive frame loader
        └── nearest-loaded-frame fallback
```

## Files

### Create

- `src/features/home/presentation/hero-canvas-sequence.tsx`
- `src/features/home/presentation/hero-frame-sequence.ts`
- `src/features/home/presentation/hero-frame-loader.ts`
- `src/features/home/presentation/hero-text-motion.tsx`
- `public/media/hero-capsules-sequence/frame-0001.webp` … `frame-0096.webp`
- `public/media/hero-capsules-poster.webp`

### Modify

- `src/features/home/presentation/scroll-video-hero.tsx`
- `src/features/home/presentation/scroll-video-hero.test.tsx`
- `tests/e2e/home-hero.spec.ts`
- `package.json`, `pnpm-lock.yaml` keep GSAP/ScrollTrigger

### Remove

- `src/features/home/presentation/video-scrubber.tsx`
- `src/features/home/presentation/video-playhead.ts`
- `src/features/home/presentation/video-playhead.test.ts`

## Implementation

### Phase 1 — Tests first

- [ ] Test progress-to-frame mapping clamps 0…95.
- [ ] Test frame URL naming and batch grouping.
- [ ] Test hero renders poster + canvas contract and no `<video>`.
- [ ] Test mobile/reduced-motion does not activate sequence.

### Phase 2 — Generate assets

- [ ] Extract 96 WebP frames from 2s–10s, crop 1920×1440 then scale 1440×1080.
- [ ] Use frame 0001 as poster so canvas reveal cannot flash to another composition.
- [ ] Verify frame count, dimensions, format and total size.

### Phase 3 — Canvas renderer

- [ ] SSR poster always present.
- [ ] Detect `(min-width: 768px)` and reduced motion before creating canvas loader.
- [ ] Draw with DPR capped at 2 and contain-fit calculation.
- [ ] Load current frame first; background batches of 12 load progressively.
- [ ] Draw closest loaded frame while an exact requested frame is pending.
- [ ] Cleanup ScrollTrigger, ResizeObserver and queued loads.

### Phase 4 — HTML motion + layout

- [ ] True split panel: content left, canvas/poster right.
- [ ] Desktop text gets scroll-linked fade/translateY/stagger timeline separate from canvas.
- [ ] Mobile text gets one light entrance animation only.
- [ ] Reduced motion keeps all HTML static.
- [ ] Desktop `300vh`; mobile normal flow without sticky pin.

### Phase 5 — Verification

- [ ] Unit, lint, typecheck and production build pass.
- [ ] Desktop E2E verifies canvas, frame progress and poster fallback.
- [ ] Mobile E2E verifies no canvas/video/sequence requests.
- [ ] Reduced-motion E2E verifies poster-only mode.
- [ ] Compare desktop screenshot with `design.png` and mobile at 375px.

## Success Criteria

- Repository contains no `video.currentTime` logic in the hero.
- Homepage renders no `<video>` element.
- Desktop maps scroll deterministically to 96 frames without media seeking.
- Mobile network requests contain no `hero-capsules-sequence/` assets.
- Poster is visible until first canvas frame is ready and remains the error fallback.
- No long mobile pin, horizontal overflow, console error or heavy reduced-motion animation.

## Unresolved

- None. User explicitly replaced the previous architecture on 2026-07-11.
