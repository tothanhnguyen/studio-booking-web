# Three-state pinned hero implementation plan

**Goal:** Giữ hero desktop ở đúng 300vh và trình bày ba composition hoàn chỉnh trong một pinned scroll experience.

**Architecture:** Canvas sequence tiếp tục map tuyến tính từ scroll progress sang 96 frame. Một GSAP controller riêng điều khiển ba lớp HTML theo cùng progress, với State 2 có khoảng giữ dài hơn; mobile/reduced-motion không khởi tạo canvas hay pinned timeline.

**Tech stack:** Next.js 16, React 19, Tailwind CSS, GSAP ScrollTrigger, Vitest, Playwright.

## Constraints

- Không dùng video hoặc `video.currentTime`.
- Desktop section đúng `300vh`, sticky viewport và ba state.
- Mobile hiển thị State 2 cùng poster; room selector là section thường bên dưới.
- HTML motion chỉ dùng opacity, transform và blur nhẹ.
- Room hover/focus không thay đổi frame loader.

## Tasks

- [ ] Mở rộng component test để yêu cầu đủ ba state, room links, CTA và không có video.
- [ ] Thêm pure progress/state helpers và test ranh giới state.
- [ ] Tách Brand Reveal, Main Hero và Room Selector thành component HTML riêng.
- [ ] Thay hero text motion bằng desktop three-state timeline, pointer-event và active-state semantics.
- [ ] Giữ canvas loader hiện tại; thêm visual overlay hover/focus độc lập bằng CSS/React state.
- [ ] Render mobile State 2 + poster và room selector flow bình thường, không pin dài.
- [ ] Chạy focused tests, full verification, production build và Playwright desktop/mobile.
- [ ] Kiểm tra trực quan ở desktop, mobile và reduced-motion.
