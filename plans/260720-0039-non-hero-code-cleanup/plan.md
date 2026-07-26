---
title: "Non-hero frontend and backend code cleanup"
status: in-progress
priority: frontend-first
blockedBy: []
blocks: []
---

# Non-hero Frontend and Backend Code Cleanup

## Mục tiêu

Làm code dễ đọc và dễ tự chỉnh sửa hơn mà không đổi UI, route, API contract hoặc business behavior. Bỏ hoàn toàn `src/features/home/**` và hero page khỏi phạm vi.

## Nguyên tắc comment

- Chỉ note tại business rule, lifecycle, timezone, authorization, transaction/idempotency hoặc mapping khó suy ra từ code.
- Không comment lại tên hàm, JSX hoặc thao tác hiển nhiên.
- Ưu tiên tên biến/hàm rõ nghĩa, helper nhỏ và cấu trúc file trước khi dùng comment.
- Comment giải thích **vì sao**, không diễn giải **code đang làm gì**.

## Phạm vi loại trừ

- Hero: `src/features/home/**`, `src/app/page.tsx`, `src/styles/hero.css`.
- Prisma generated files: `src/generated/**`.
- Media, database schema và migration.
- Thay đổi thiết kế, copy, accessibility name hoặc nghiệp vụ.

## Phase 1 — Shared FE foundation

- [x] Clean `src/components/app-shell.tsx`, `site-footer.tsx` và `src/components/ui/**`.
- [x] Tách constant/helper dùng lại; chuẩn hóa props và JSX nhiều dòng.
- [x] Note các boundary như public room slug, responsive navigation và form ownership nếu lý do chưa rõ.
- [x] Hoàn tất review/test gate của Phase 1.

## Phase 2 — Public, auth và account FE

- Clean các trang `/studios`, `/services`, `/login`, `/register`, `/account/**`.
- Clean presentation của studio/service/auth/customer dashboard.
- Giữ server-component data loading và authorization ở đúng boundary hiện tại.

## Phase 3 — Booking và payment FE

- Tách `booking-wizard.tsx` thành state orchestration và step components/helper rõ nghĩa.
- Clean booking progress/summary/countdown và payment presentation.
- Note timezone, hold duration, deposit/payment state ở nơi có business meaning.

## Phase 4 — Admin FE

- Clean admin route pages, dashboard presentation, room/service form và schedule editor.
- Tách parser/formatter/table row/helper lặp lại; giảm JSX một dòng quá dài.
- Note các quyền và lifecycle action khó thấy, không comment CRUD hiển nhiên.

## Phase 5 — FE verification và tài liệu

- Chạy lint, typecheck, unit tests và E2E liên quan theo từng nhóm.
- Visual smoke test desktop/mobile để xác nhận không đổi UI.
- Cập nhật `docs/ui/**` khi vị trí chỉnh sửa thay đổi.

## Phase 6 — Backend cleanup (sau FE)

- Clean theo thứ tự: app actions/routes → application/domain → infrastructure/provider.
- Tập trung vào booking, availability, payment, auth, notification và observability.
- Note transaction boundary, lock/idempotency, refund/payment transitions, timezone và security assumptions.
- Chạy unit/integration tests theo feature; không thay API/database behavior.

## Tiêu chí hoàn tất

- Không có file hero hoặc generated Prisma bị sửa.
- Không đổi UI snapshot, route, accessible name, API contract hoặc business result.
- File dài/khó đọc được chia theo trách nhiệm; không tạo abstraction chỉ dùng một lần nếu không giúp rõ nghĩa.
- Comment có giá trị giải thích và không trùng lặp với code.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` và test liên quan đều pass.
