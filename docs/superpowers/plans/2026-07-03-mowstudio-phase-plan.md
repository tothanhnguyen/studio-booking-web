# Kế hoạch triển khai chi tiết theo phase — MowStudio

> **Dành cho agent triển khai:** BẮT BUỘC dùng sub-skill `superpowers:subagent-driven-development` (khuyến nghị) hoặc `superpowers:executing-plans` để thực hiện lần lượt từng task. Các bước dùng cú pháp checkbox (`- [ ]`) để theo dõi.

**Mục tiêu:** Triển khai MowStudio theo từng phase dưới dạng modular monolith có kiểm thử, hoàn thành MVP production trên Vercel, sau đó mới thực hiện visual polish và DigitalOcean deployment nếu cần.

**Kiến trúc:** Feature module nằm trong `src/features` và export application service qua `index.ts` của module. Next.js page, route handler và Server Action là transport adapter; business service dùng repository/provider interface rõ ràng; Prisma repository và parameterized SQL có kiểm soát đảm nhiệm persistence. PostgreSQL transaction và advisory lock bảo vệ availability cùng payment transition.

**Ngăn xếp công nghệ:** Node.js 24 LTS, pnpm, Next.js 16 ổn định, React 19, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Prisma ORM 7, Supabase, PostgreSQL, Vitest, Playwright, Sentry, GitHub Actions, Vercel; về sau mới bổ sung React Three Fiber, Docker, Caddy, GHCR và DigitalOcean Ubuntu.

## Ràng buộc toàn cục

- Tuân theo `docs/superpowers/specs/2026-07-03-mowstudio-design.md`; nếu plan mâu thuẫn với design spec thì design spec được ưu tiên.
- UI và nội dung email dùng tiếng Việt; identifier trong code dùng tiếng Anh.
- Lưu instant bằng UTC; timezone sản phẩm/room là `Asia/Ho_Chi_Minh`.
- Một booking chứa một service thuộc một room.
- Slot theo lưới 15 phút; interval overlap là `[startTime, bufferEndTime)`.
- Hold kéo dài 10 phút; deposit là 30% và lưu bằng số nguyên VND.
- Payment `ROOM_ONLY` tự động confirm; payment `ASSISTED` chuyển sang `PENDING` đến khi admin confirm.
- Server sở hữu pricing, availability, authorization và transition.
- Supabase browser client không bao giờ mutate trực tiếp bảng booking/payment.
- Mặc định dùng Server Component; Client Component chỉ dùng tại interaction boundary.
- Chỉ dùng parameterized raw SQL trong các repository file được nêu trong plan.
- Notification failure không bao giờ rollback booking/payment transaction.
- MVP không có giỏ hàng, combo, thành viên, voucher, kho thiết bị, lựa chọn nhân viên, tự động refund, Stripe, i18n hoặc ứng dụng di động.
- MVP không dùng Jenkins, microservices, Kubernetes, Prometheus, Grafana hoặc OpenTelemetry.
- Mỗi nhiệm vụ kèm theo red → green → focused suite → commit.

---

## Sơ đồ file mục tiêu

```text
.
├── .env.example
├── .github/workflows/ci.yml
├── docker-compose.test.yml
├── next.config.ts
├── package.json
├── playwright.config.ts
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── scripts/
│   ├── check-env.ts
│   ├── migrate-production.mjs
│   └── smoke-production.mjs
├── src/
│   ├── app/                         # Routes, layouts, route handlers
│   ├── components/                  # Shared UI primitives and shells only
│   ├── features/
│   │   ├── auth/
│   │   ├── studio-room/
│   │   ├── service/
│   │   ├── availability/
│   │   ├── booking/
│   │   ├── payment/
│   │   ├── notification/
│   │   ├── dashboard/
│   │   └── observability/
│   ├── lib/                         # Cross-cutting DB, env, time, money
│   └── generated/prisma/            # Generated, not hand-edited
├── tests/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── setup/
├── vitest.config.ts
└── vitest.integration.config.ts
```

Cấu trúc bên trong module khi cần:

```text
src/features/<feature>/
├── domain/          # Pure types, policies, state machines
├── application/     # Use-case services and ports
├── infrastructure/  # Prisma/provider adapters
├── presentation/    # Feature-owned server/client UI
└── index.ts          # Narrow public exports
```

Không tạo directory rỗng. Chỉ thêm layer tại task thực sự cần nó.

## Hợp đồng interface dùng chung

Các tên sau phải ổn định xuyên suốt các phase:

```ts
export type AppRole = "CUSTOMER" | "ADMIN";
export type BookingType = "ROOM_ONLY" | "ASSISTED";
export type BookingStatus =
  | "PENDING_PAYMENT" | "PENDING" | "CONFIRMED"
  | "CANCELLED" | "EXPIRED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export type RefundStatus =
  | "NONE" | "REQUESTED" | "PROCESSING" | "REFUNDED" | "REJECTED";

export type Money = Readonly<{ amount: number; currency: "VND" }>;
export type TimeRange = Readonly<{ start: Date; end: Date }>;
export type AvailableSlot = Readonly<{
  startTime: string;
  endTime: string;
  bufferEndTime: string;
}>;
```

---

# Phase 0 — Nền tảng repository

**Kết quả:** Repository Next.js có thể tái tạo với môi trường đã được validate, PostgreSQL test local, các công cụ test và baseline CI.

**Điều kiện tiên quyết:** Design spec và cả hai plan đã được duyệt.

### Task 0.1: Khởi động ứng dụng và toolchain

**File:**
- Tạo: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`
- Tạo: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Tạo: `src/components/app-shell.tsx`
- Kiểm thử: `src/components/app-shell.test.tsx`

**Interface:**
- Cung cấp: `AppShell({ children }: { children: React.ReactNode }): JSX.Element`
- Tạo các script: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`

- [x] Viết `app-shell.test.tsx` assert app shell mang brand `MowStudio` và landmark `<main>`.
- [x] Chạy `pnpm vitest run src/components/app-shell.test.tsx`; mong đợi FAIL vì test tooling/component chưa tồn tại.
- [x] Scaffold Next.js 16 ổn định với TypeScript, App Router, Tailwind, ESLint, `src/`, import alias `@/*`, sau đó thêm Vitest, testing Library, jsdom và các script trên.
- [x] Triển khai shell và trang chủ tương thích với server ở mức tối thiểu; không thêm giao diện user booking.
- [x] Chạy `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; expect tất cả các lệnh sẽ thoát `0`.
- [x] Commit: `chore: bootstrap mowstudio application`.

**Tiêu chí chấp nhận:** Một `pnpm install --frozen-lockfile` mới theo sau là lint, typecheck, unit test và build thành công trên Node 24.

### Task 0.2: Thêm nền tảng database và môi trường typed

**File:**
- Tạo: `.env.example`, `src/lib/env/server.ts`, `src/lib/env/public.ts`, `src/lib/db/prisma.ts`
- Tạo: `prisma.config.ts`, `prisma/schema.prisma`, `docker-compose.test.yml`
- Tạo: `scripts/check-env.ts`
- Kiểm thử: `src/lib/env/server.test.ts`, `tests/integration/database-smoke.test.ts`

**Interface:**
- Cung cấp: `serverEnv` được Zod validate; `publicEnv`; singleton `prisma`
- Phím môi trường: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`

- [x] Viết bài unit test env từ chối `DATABASE_URL` bị thiếu và chấp nhận các giá trị bắt buộc hợp lệ về mặt cú pháp.
- [x] Viết một smoke test tích hợp thực thi `SELECT 1 AS value` và expect `{ value: 1 }`.
- [x] Chạy cả hai test; có thể gặp lỗi vì module env và Prisma không tồn tại.
- [x] Thêm cấu hình Prisma 7 PostgreSQL, pooled `DATABASE_URL`, `DIRECT_URL` migration trực tiếp, các module env đã được validate, singleton client và container test PostgreSQL 18 có health check.
- [x] Chạy `docker compose -f docker-compose.test.yml up -d --wait`, `pnpm prisma generate`, rồi `pnpm test:integration -- database-smoke`; expect một bài integration test pass.
- [x] Chạy `pnpm lint && pnpm typecheck && pnpm test`; expect thoát `0`.
- [x] Commit: `chore: add environment and database foundation`.

**Tiêu chí chấp nhận:** Môi trường không hợp lệ không khởi động được với tên khóa nhưng không có secret; integration test sử dụng PostgreSQL thực.

### Task 0.3: Thiết lập CI và tài liệu dành cho người đóng góp

**File:**
- Tạo: `.github/workflows/ci.yml`, `README.md`, `docs/development/testing.md`, `docs/development/environment.md`
- Sửa: `package.json`
- Kiểm thử: Tài liệu hóa CI workflow và command trong `README.md`

**Interface:**
- Tạo CI job: `quality`, `integration`, `build`
- Sử dụng script từ Task 0,1–0,2

- [x] Thêm lỗi xác thực workflow tạm thời bằng cách tham chiếu `pnpm ci:verify` trước khi script tồn tại; chạy `pnpm ci:verify` và xác nhận lỗi không tìm thấy lệnh.
- [x] Xác định `ci:verify` dưới dạng test lint + typecheck + unit, định cấu hình buffer pnpm, khởi động service PostgreSQL để integration test, tạo Prisma Client và chạy build sau khi chất lượng thành công.
- [x] Document chính xác thiết lập local, catalog môi trường, lệnh test và quy tắc rằng secret production không bao giờ được nhập vào `.env.example`.
- [x] Chạy các lệnh tương tự local: `pnpm ci:verify`, `pnpm test:integration`, `pnpm build`; expect thoát `0`.
- [x] Commit: `ci: add baseline quality gates`.

**Gate Phase 0:** Thiết lập clean clone sẽ được document và có thể tái tạo; Các lệnh local tương đương CI pass; không có hành vi tính năng nào được thực hiện.

---

# Phase 1 — Domain và persistence

**Kết quả:** Các enum ổn định, policy tiền/thời gian, schema/migration Prisma, repository và seed data xác định.

**Điều kiện tiên quyết:** Phase 0 đã qua gate.

### Task 1.1: Xác định domain primitive và policy chuyển state

**File:**
- Tạo: `src/lib/money/vnd.ts`, `src/lib/time/studio-time.ts`
- Tạo: `src/features/booking/domain/booking-types.ts`, `src/features/booking/domain/booking-policy.ts`
- Kiểm thử: `src/lib/money/vnd.test.ts`, `src/lib/time/studio-time.test.ts`, `src/features/booking/domain/booking-policy.test.ts`

**Interface:**
- Cung cấp: `calculateDeposit(subtotal: number): { depositAmount: number; remainingAmount: number }`
- Cung cấp: `toUtcFromStudioLocal(date: string, time: string): Date`, `toStudioDateKey(date: Date): string`
- Cung cấp: `canTransitionBooking(from: BookingStatus, to: BookingStatus, context: TransitionContext): boolean`

- [x] Viết test cho `calculateDeposit(1_000_001)`, chuyển đổi giờ local `2026-07-03 09:15` và mọi booking transition được phép/bị cấm trong design spec.
- [x] Chạy ba tập tin test focused; expect lỗi không tìm thấy module.
- [x] Triển khai phép tính deposit 30% an toàn với số nguyên, chuyển đổi timezone bằng thư viện timezone-aware, shared enum và transition policy dạng bảng.
- [x] Chạy test focused; expect tất cả các trường hợp biên sẽ pass, bao gồm cả bối cảnh ranh giới hủy chính xác trong 24 giờ.
- [x] Chạy `pnpm ci:verify`; expect thoát `0`.
- [x] Commit: `feat: define booking domain primitives`.

**Tiêu chí chấp nhận:** Domain function thuần, không phụ thuộc timezone của host và từ chối amount VND âm hoặc không phải số nguyên.

### Task 1.2: Tạo schema quan hệ hoàn chỉnh và lần migration đầu tiên

**File:**
- Sửa: `prisma/schema.prisma`
- Tạo: `prisma/migrations/<generated_timestamp>_initial_domain/migration.sql`
- Kiểm thử: `tests/integration/schema-constraints.test.ts`

**Interface:**
- Cung cấp Prisma model: `User`, `CustomerProfile`, `StudioRoom`, `Service`, `WorkingHour`, `BlockedSlot`, `Booking`, `Payment`, `NotificationLog`, `AuditLog`, `PaymentEvent`
- Tạo index cho overlap query theo room/ngày, provider idempotency, normalized email, slug và status/expiry query.

- [x] Viết các bài integration test nhằm thử các slug room/service trùng lặp, hồ sơ một-một không hợp lệ, khóa sự kiện của provider trùng lặp và bản ghi kết thúc trước khi bắt đầu; expect sự từ chối database.
- [x] Chạy test với schema trống; expect lỗi mô hình/bảng.
- [x] Định nghĩa enum/model theo design spec, gồm snapshot field, integer money, UTC timestamp, token hash, audit metadata JSON và check constraint bổ sung bằng migration SQL khi Prisma không biểu đạt được.
- [x] Tạo và áp dụng quá trình migration sang database test mới.
- [x] Chạy `pnpm test:integration -- schema-constraints`; expect tất cả các test ràng buộc để pass.
- [x] Chạy `pnpm prisma validate && pnpm ci:verify`; expect thoát `0`.
- [x] Commit: `feat: add initial booking data model`.

**Tiêu chí chấp nhận:** Database mới migrate được từ zero; range/amount không hợp lệ và idempotency key trùng đều bị PostgreSQL từ chối, không chỉ dựa vào application validation.

### Task 1.3: Thêm hợp đồng repository và seed xác định

**File:**
- Tạo: `src/features/studio-room/application/room-repository.ts`, `src/features/studio-room/infrastructure/prisma-room-repository.ts`
- Tạo: `src/features/service/application/service-repository.ts`, `src/features/service/infrastructure/prisma-service-repository.ts`
- Tạo: `src/features/booking/application/booking-repository.ts`
- Tạo: `prisma/seed.ts`, `tests/fixtures/catalog.ts`
- Kiểm thử: `tests/integration/catalog-repositories.test.ts`, `tests/integration/seed.test.ts`

**Interface:**
- Cung cấp: `RoomRepository.findActiveBySlug(slug)`, `RoomRepository.listActive()`
- Cung cấp: `ServiceRepository.findActiveById(id)`, `findActiveBySlug(slug)`, `listByRoom(roomId)`
- Tạo ra slug room xác định: `photo-studio`, `voice-podcast-booth`, `music-studio`

- [x] Viết các bài integration test để lọc hoạt động, quan hệ room/service, seed kép idempotent và slug ba room chính xác.
- [x] Chạy test; expect lỗi repository/seed.
- [x] Triển khai các hợp đồng/bộ điều hợp repository hẹp và seed dựa trên upsert với các service `ROOM_ONLY` và `ASSISTED` đại diện cùng với số giờ hàng tuần.
- [x] Chạy seed hai lần, sau đó chạy test repository và seed; expect số lượng không thay đổi và các assertion pass.
- [x] Chạy `pnpm ci:verify && pnpm test:integration`; expect thoát `0`.
- [x] Commit: `feat: add catalog repositories and seed data`.

**Gate Phase 1:** Fresh migrate + seed tạo đúng 3 room; domain, schema constraint và repository suite đều pass.

---

# Phase 2 - Catalog và wireframe chức năng

**Kết quả:** Các trang khám phá công khai và CRUD service/room quản trị được bảo vệ bằng server sử dụng giao diện user đáp ứng chức năng.

**Điều kiện tiên quyết:** Phase 1 đã qua gate.

### Task 2.1: Xây dựng room public và khám phá service

**File:**
- Tạo: `src/app/studios/page.tsx`, `src/app/studios/[slug]/page.tsx`, `src/app/services/[slug]/page.tsx`
- Tạo: `src/features/studio-room/application/list-public-rooms.ts`, `src/features/studio-room/presentation/room-card.tsx`
- Tạo: `src/features/service/application/get-public-service.ts`, `src/features/service/presentation/service-card.tsx`
- Sửa: `src/app/page.tsx`
- Kiểm thử: `src/features/studio-room/application/list-public-rooms.test.ts`, `tests/e2e/public-catalog.spec.ts`

**Interface:**
- Cung cấp: `listPublicRooms(): Promise<PublicRoom[]>`
- Cung cấp: `getPublicServiceBySlug(slug): Promise<PublicService | null>`
- Sử dụng giao diện repository từ Task 1.3

- [x] Viết test service chứng minh không có room/service không hoạt động và E2E test điều hướng nhà → studio → room → service → CTA booking.
- [x] Chạy test focused; expect các lỗi về tuyến đường/trường hợp sử dụng.
- [x] Triển khai các trang Component Server, thẻ thuộc sở hữu tính năng, metadata, state trống/không tìm thấy tiếng Việt và điều hướng ngữ nghĩa bằng cách sử dụng dữ liệu gốc.
- [x] Chạy test unit focused và E2E ở chế độ xem trên máy tính để bàn và thiết bị di động; expect pass.
- [x] Chạy `pnpm ci:verify && pnpm build`; expect thoát `0`.
- [x] Commit: `feat: add public studio catalog`.

**Tiêu chí chấp nhận:** Tất cả ba room và service đang hoạt động đều có thể được khám phá mà không cần tìm nạp dữ liệu phía customer; slug không hợp lệ trả về trang không tìm thấy Next.js.

### Task 2.2: Thiết lập ranh giới phân quyền admin có thể sử dụng lại

**File:**
- Tạo: `src/features/auth/application/current-actor.ts`, `src/features/auth/application/require-role.ts`
- Tạo: `src/app/admin/layout.tsx`, `src/features/dashboard/presentation/admin-shell.tsx`
- Kiểm thử: `src/features/auth/application/require-role.test.ts`, `tests/e2e/admin-denial.spec.ts`

**Interface:**
- Cung cấp: `getCurrentActor(): Promise<Actor | null>`
- Cung cấp: `requireRole(role: AppRole): Promise<Actor>` throwing typed `UnauthenticatedError`/`ForbiddenError`
- Bộ điều hợp test Task 2 tạm thời có thể tiêm các tác nhân; Phase 4 thay thế độ phân giải phiên mà không thay đổi chữ ký

- [x] Viết bài unit test cho các quyết định của khách/customer/admin và xác nhận E2E rằng khách/customer không thể hiển thị nội dung admin.
- [x] Chạy test; expect thất bại bảo vệ mất tích.
- [x] Triển khai cổng phân giải tác nhân chỉ dành cho server, lỗi đánh máy, trình bảo vệ bố cục admin và shell quản trị tiếng Việt có thể truy cập được.
- [x] Chạy test focused; expect tất cả các nhánh từ chối/cho phép pass.
- [x] Commit: `feat: enforce admin route boundary`.

**Tiêu chí chấp nhận:** Không thể truy cập trang quản trị bằng cách thay đổi URL; authorization xảy ra trước khi dữ liệu được bảo vệ được tải.

### Task 2.3: Thêm room quản trị và quản lý service

**File:**
- Tạo: `src/app/admin/rooms/page.tsx`, `src/app/admin/services/page.tsx`
- Tạo: `src/features/studio-room/application/manage-room.ts`, `src/features/studio-room/presentation/room-form.tsx`
- Tạo: `src/features/service/application/manage-service.ts`, `src/features/service/presentation/service-form.tsx`
- Kiểm thử: `src/features/studio-room/application/manage-room.test.ts`, `src/features/service/application/manage-service.test.ts`, `tests/e2e/admin-catalog.spec.ts`

**Interface:**
- Cung cấp: `upsertRoom(actor, input)`, `setRoomActive(actor, roomId, active)`
- Cung cấp: `upsertService(actor, input)`, `setServiceActive(actor, serviceId, active)`
- Đầu vào được phân tích cú pháp Zod; duration/buffer là số phút dương/không âm và giá là số nguyên dương VNĐ

- [x] Viết các test service không thành công về duration/giá không hợp lệ, ánh xạ slug trùng lặp, tác nhân trái phép và tạo intent test.
- [x] Viết E2E test mà admin chỉnh sửa service và khám phá công khai phản ánh sự thay đổi.
- [x] Triển khai các biểu mẫu máy khách RHF/Zod tối thiểu gọi các Hành động server được bảo vệ được hỗ trợ bởi các service ứng dụng và repository.
- [x] Chạy test unit/E2E; expect các notification xác thực bằng tiếng Việt và những thay đổi liên tục.
- [x] Chạy `pnpm ci:verify && pnpm build`; expect thoát `0`.
- [x] Commit: `feat: manage studio rooms and services`.

**Gate Phase 2:** Catalog hành trình công khai và thẻ hành trình CRUD của admin; việc từ chối admin customer/khách được thể hiện là E2E.

---

# Phase 3 - Availability và đặt chỗ nguyên tử

**Kết quả:** Giờ làm việc, slot bị chặn, availability được authorization của server, wizard dành cho khách gồm 5 bước, token truy cập của khách và thời gian lưu giữ 10 phút an toàn đồng thời.

**Điều kiện tiên quyết:** Phase 1 và Phase 2 đã qua gate.

### Task 3.1: Triển khai công cụ availability thuần túy

**File:**
- Tạo: `src/features/availability/domain/generate-slots.ts`, `src/features/availability/domain/overlap.ts`
- Tạo: `src/features/availability/application/availability-types.ts`
- Kiểm thử: `src/features/availability/domain/generate-slots.test.ts`, `src/features/availability/domain/overlap.test.ts`

**Interface:**
- Cung cấp: `overlaps(a: TimeRange, b: TimeRange): boolean`
- Cung cấp: `generateAvailableSlots(input: GenerateSlotsInput): AvailableSlot[]`
- `GenerateSlotsInput` chứa ngày được khoanh vùng, working window, duration, buffer, phạm vi bị chặn, phạm vi đăng ký và `now`

- [x] Viết các test bảng để biết độ kề chính xác, chồng chéo một phút, lưới 15 phút, phân chia working window, duration+tràn buffer, các slot trong quá khứ và các khoản giữ đã hết hạn bị caller loại trừ.
- [x] Chạy test focused; expect lỗi module bị thiếu.
- [x] Triển khai sự chồng chéo nửa mở và tạo khe xác định dưới dạng các hàm thuần túy.
- [x] Chạy test dưới hai giá trị `TZ` của server khác nhau; expect kết quả giống hệt nhau.
- [x] Chạy `pnpm ci:verify`; expect thoát `0`.
- [x] Commit: `feat: implement availability slot engine`.

**Tiêu chí chấp nhận:** Tạo slot bao gồm mọi quy tắc trong phần thiết kế 8 và không phụ thuộc vào database/khung.

### Task 3.2: Thêm lịch trình và quản lý slot bị chặn

**File:**
- Tạo: `src/app/admin/schedule/page.tsx`, `src/app/admin/blocked-slots/page.tsx`
- Tạo: `src/features/availability/application/schedule-repository.ts`, `src/features/availability/infrastructure/prisma-schedule-repository.ts`
- Tạo: `src/features/availability/application/manage-schedule.ts`, `src/features/availability/presentation/schedule-editor.tsx`
- Kiểm thử: `src/features/availability/application/manage-schedule.test.ts`, `tests/integration/schedule-repository.test.ts`, `tests/e2e/admin-schedule.spec.ts`

**Interface:**
- Cung cấp: `replaceWorkingHours(actor, roomId, weekday, windows)`
- Cung cấp: `createBlockedSlot(actor, input)`, `deleteBlockedSlot(actor, blockedSlotId)`
- Repository từ chối các working window chồng chéo và các slot bị chặn kéo dài nhiều ngày local

- [x] Viết các bài unit test/tích hợp cho các cửa sổ chồng chéo, xác thực bắt đầu/kết thúc, ranh giới ngày local, authorization và test.
- [x] Chạy test focused; expect những thất bại trong việc triển khai bị thiếu.
- [x] Triển khai các service được bảo vệ, repository Prisma, trình chỉnh sửa lịch trình response và danh sách/biểu mẫu slot bị chặn.
- [x] Chạy test unit, tích hợp và lịch trình E2E; expect pass.
- [x] Commit: `feat: manage room schedules and blocked slots`.

**Tiêu chí chấp nhận:** Những thay đổi của admin ảnh hưởng đến lịch room cố định; các cửa sổ không hợp lệ/chồng chéo và các khối nhiều ngày bị từ chối bằng các notification an toàn.

### Task 3.3: Hiển thị availability có thẩm quyền của server

**File:**
- Tạo: `src/features/availability/application/get-available-slots.ts`
- Tạo: `src/app/api/availability/route.ts`
- Kiểm thử: `src/features/availability/application/get-available-slots.test.ts`, `tests/integration/availability-query.test.ts`

**Interface:**
- Cung cấp: `getAvailableSlots({ serviceId, date, now }): Promise<AvailableSlot[]>`
- Truy vấn HTTP: `serviceId=<uuid>&date=YYYY-MM-DD`; response `{ data: AvailableSlot[], requestId: string }`

- [x] Viết test về service không hoạt động, ngăn ngừa tình trạng không khớp room, giờ làm việc, hold đang hoạt động, hold hết hạn, booking đang chờ xử lý/xác nhận, chỗ bị chặn và ngày truy vấn không hợp lệ.
- [x] Chạy test focused; expect trường hợp sử dụng/tuyến đường bị thiếu.
- [x] Triển khai repository query composition, gọi pure availability engine, parse query bằng Zod, route response tắt cache và error mapping ổn định, an toàn.
- [x] Chạy test unit/tích hợp và test tuyến đường trực tiếp; expect hình dạng JSON được document và chặn chính xác.
- [x] Commit: `feat: expose booking availability`.

**Tiêu chí chấp nhận:** Availability được tính hoàn toàn trên server; hold hết hạn không còn block dù row vẫn mang `PENDING_PAYMENT`.

### Task 3.4: Tạo hold nguyên tử

**File:**
- Tạo: `src/features/booking/application/create-booking.ts`, `src/features/booking/application/booking-command.ts`
- Tạo: `src/features/booking/infrastructure/prisma-booking-repository.ts`, `src/features/booking/infrastructure/booking-lock.ts`
- Tạo: `src/lib/security/guest-token.ts`
- Kiểm thử: `src/features/booking/application/create-booking.test.ts`, `tests/integration/booking-concurrency.test.ts`, `tests/integration/booking-rollback.test.ts`

**Interface:**
- Cung cấp: `createBooking(command: CreateBookingCommand): Promise<CreatedBookingAccess>`
- Cung cấp: `withRoomDateLock(tx, roomId, localDate, callback)` bằng `pg_advisory_xact_lock`
- Cung cấp: `CreatedBookingAccess = { bookingId: string; guestToken: string; holdExpiresAt: string }`

- [x] Viết một test service chứng minh giá/kết thúc/state của customer bị bỏ qua và test barrier PostgreSQL khởi chạy hai giao dịch cùng một slot.
- [x] Viết các test rollback cho lỗi chồng chéo và tạo hàng payment; expect không có bản ghi một phần.
- [x] Chạy test focused; expect những thất bại trong việc triển khai bị thiếu.
- [x] Triển khai lock key ổn định, parameterized; overlap re-query trong transaction; server snapshot; hold 10 phút; pending payment row; random guest token và chỉ lưu hash.
- [x] Chạy test đồng thời nhiều lần (tối thiểu 20 cuộc đua); expect chính xác một thành công và một xung đột xảy ra trong mọi cuộc đua.
- [x] Chạy bộ tích hợp rollback/bộ unit đầy đủ; expect thoát `0`.
- [x] Commit: `feat: create concurrency-safe booking holds`.

**Tiêu chí chấp nhận:** Không có sự xen kẽ được test nào sẽ tạo ra hai lượt đăng ký chặn chồng chéo; token khách thô không bao giờ xuất hiện trong xác nhận database/log.

### Task 3.5: Xây dựng quy trình booking gồm 5 bước của khách

**File:**
- Tạo: `src/app/booking/[id]/page.tsx`, `src/app/booking/[id]/payment/page.tsx`, `src/app/booking/[id]/confirmation/page.tsx` (`id` ở route gốc là service ID; Next.js yêu cầu cùng tên dynamic segment)
- Tạo: `src/features/booking/presentation/booking-wizard.tsx`, `booking-summary.tsx`, `hold-countdown.tsx`
- Tạo: `src/features/booking/application/get-guest-booking.ts`, `src/features/booking/application/booking-actions.ts`
- Kiểm thử: `src/features/booking/application/get-guest-booking.test.ts`, `tests/e2e/guest-booking.spec.ts`, `tests/e2e/guest-access.spec.ts`

**Interface:**
- Hành động server tạo đặt chỗ sử dụng thông tin input liên hệ/bắt đầu đã được Zod xác thực và đặt cookie truy cập của khách trong phạm vi an toàn có chứa token thô.
- Cung cấp: `getGuestBooking(bookingId, rawToken): Promise<GuestBookingView>`bằng so sánh hash constant-time.

- [x] Viết E2E test cho tất cả năm bước, rollback slot cũ bảo toàn dữ liệu liên hệ, countdown giữ, từ chối ID trực tiếp mà không cần token và điều hướng bàn phím di động.
- [x] Chạy test E2E; expect lỗi tuyến đường/component.
- [x] Triển khai wizard RHF/Zod, state tải khả dụng, hành động của server, chiến lược cookie token an toàn, state hướng dẫn payment trước khi tích hợp và chế độ xem state xác nhận.
- [x] Chạy đặt chỗ/truy cập khách E2E trên máy tính để bàn/thiết bị di động; expect pass và không có token nhạy cảm trong đánh dấu trang hoặc log.
- [x] Chạy `pnpm ci:verify && pnpm test:integration && pnpm build`; expect thoát `0`.
- [x] Commit: `feat: add guest booking wizard`.

**Gate Phase 3:** Khách có thể lấy và xem riêng thời gian chờ 10 phút; test cuộc đua PostgreSQL thực sự chứng minh một người chiến thắng; wizard rollback slot cũ hoạt động.

---

# Phase 4 - Xác thực, RBAC và dashboard

**Kết quả:** Email/mật khẩu Supabase + xác thực Google, đồng bộ hóa danh tính local, quyền sở hữu tài khoản, claim của khách đã được xác minh, lịch sử customer và chế độ xem của admin vận hành.

**Điều kiện tiên quyết:** Phase 3 đã qua gate; Supabase development project đã được cấu hình.

### Task 4.1: Tích hợp Supabase Auth và đồng bộ hóa user local

**File:**
- Tạo: `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Tạo: `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/auth/callback/route.ts`
- Tạo: `src/features/auth/application/sync-user.ts`, `src/features/auth/infrastructure/prisma-user-repository.ts`
- Sửa: `src/features/auth/application/current-actor.ts`, root middleware/proxy file required by installed Next.js version
- Kiểm thử: `src/features/auth/application/sync-user.test.ts`, `tests/integration/user-sync.test.ts`, `tests/e2e/auth.spec.ts`

**Interface:**
- `getCurrentActor()` hiện giải quyết phiên server Supabase và user local.
- Cung cấp: `syncAuthenticatedUser(identity): Promise<User>` defaulting new users to `CUSTOMER`; never accepts role from client metadata.

- [x] Viết test cho lần đăng nhập đầu tiên, đăng nhập nhiều lần, thay đổi email đã được xác minh, email chưa được xác minh và metadata role customer độc hại.
- [x] Chạy test; mong đợi FAIL vì temporary actor adapter chưa được thay thế.
- [x] Triển khai client/làm mới cookie Supabase an toàn SSR, biểu mẫu đăng nhập/đăng ký bằng tiếng Việt, callback Google và đồng bộ hóa local idempotent.
- [x] Chạy auth unit/integration/E2E với test identity; mong đợi email/password và Google callback fixture đều pass.
- [x] Commit: `feat: integrate supabase authentication`.

**Tiêu chí chấp nhận:** User mới luôn là `CUSTOMER`; cookie phiên được bảo mật; role admin không thể tự chỉ định.

### Task 4.2: Thực hiện quyền sở hữu booking và xác nhận yêu cầu của khách

**File:**
- Tạo: `src/features/auth/application/claim-guest-bookings.ts`
- Sửa: `src/features/booking/application/booking-repository.ts`, `src/features/booking/infrastructure/prisma-booking-repository.ts`
- Tạo: `src/features/auth/presentation/claim-bookings-banner.tsx`
- Kiểm thử: `src/features/auth/application/claim-guest-bookings.test.ts`, `tests/integration/guest-claim.test.ts`, `tests/e2e/guest-claim.spec.ts`

**Interface:**
- Cung cấp: `claimGuestBookings(actor: VerifiedActor): Promise<{ claimedCount: number }>`
- Repository dùng compare-and-set, chỉ update row `userId IS NULL` khớp normalized verified email.

- [x] Viết các test đối sánh đã được xác minh, đối sánh theo trường hợp chuẩn hóa, tài khoản chưa được xác minh, đặt chỗ đã sở hữu, yêu cầu cạnh tranh, thử lại idempotent và hàng test.
- [x] Chạy test focused; expect những thất bại về claim bị thiếu.
- [x] Triển khai hành động xác nhận quyền sở hữu rõ ràng, phương pháp repository so sánh và thiết lập giao dịch, bản sao biểu ngữ/kết quả và metadata test được che giấu.
- [x] Chạy claim unit/integration/E2E; chỉ booking chưa có owner và đủ điều kiện mới được gán owner.
- [x] Commit: `feat: claim verified guest bookings`.

**Tiêu chí chấp nhận:** Claim không thể lấy cắp đặt chỗ đã sở hữu và việc lặp lại không có tác dụng bổ sung.

### Task 4.3: Thêm bảng thông tin booking của customer và admin

**File:**
- Tạo: `src/app/account/bookings/page.tsx`, `src/app/account/bookings/[id]/page.tsx`
- Tạo: `src/app/admin/page.tsx`, `src/app/admin/bookings/page.tsx`, `src/app/admin/bookings/calendar/page.tsx`, `src/app/admin/bookings/[id]/page.tsx`
- Tạo: `src/features/dashboard/application/customer-booking-queries.ts`, `admin-booking-queries.ts`
- Tạo: `src/features/dashboard/presentation/booking-status-badge.tsx`, `booking-calendar.tsx`
- Kiểm thử: `src/features/dashboard/application/customer-booking-queries.test.ts`, `admin-booking-queries.test.ts`, `tests/e2e/dashboards.spec.ts`

**Interface:**
- Cung cấp owner-scoped `listCustomerBookings(actor, filters)` và `getCustomerBooking(actor, id)`.
- Cung cấp admin-only `listAdminBookings(actor, filters)` và `getAdminCalendar(actor, range)`.

- [x] Viết các test chứng minh sự cô lập của owner, hành vi của khách/customer/admin, ranh giới bộ lọc và transition hiển thị UTC sang studio.
- [x] Chạy test; expect lỗi truy vấn/trang bị thiếu.
- [x] Triển khai các service truy vấn server, trang chi tiết/danh sách được phân trang, bộ lọc quản trị và fallback lịch/danh sách 2D có thể truy cập.
- [x] Chạy dashboard E2E gồm cross-account direct-ID denial và non-admin admin-query denial.
- [x] Chạy `pnpm ci:verify && pnpm test:integration && pnpm build`; expect thoát `0`.
- [x] Commit: `feat: add customer and admin booking dashboards`.

**Gate Phase 4:** Auth, ownership, verified claim, customer history, admin view và non-admin denial đều pass E2E.

---

# Phase 5 - Payment, vòng đời đặt chỗ và notification

**Kết quả:** Payment trung lập với provider, SePay/ VietQR, xử lý webhook idempotent được validate, transition loại đặt chỗ, xác nhận của admin, theo dõi hủy/refund, email và test.

**Điều kiện tiên quyết:** Gate Phase 4 đã qua; Có sẵn credential test/sandbox SePay và credential test provider email.

### Task 5.1: Xác định provider payment và hợp đồng sự kiện

**File:**
- Tạo: `src/features/payment/domain/payment-types.ts`, `src/features/payment/application/payment-provider.ts`
- Tạo: `src/features/payment/application/payment-policy.ts`
- Kiểm thử: `src/features/payment/application/payment-policy.test.ts`

**Interface:**
- Cung cấp: `PaymentProvider.createInstructions(input): Promise<PaymentInstructions>`
- Cung cấp: `PaymentProvider.verifyAndNormalizeWebhook(request): Promise<NormalizedPaymentEvent>`
- `NormalizedPaymentEvent` chứa provider, eventId, bookingReference, số tiền, tiền tệ, đã xảy raAt, metadata xác thực; không có trường dành riêng cho provider nào nhập service đặt chỗ.

- [ ] Viết test cho exact deposit, underpayment, overpayment, sai currency/reference, cumulative amount trùng và provider-neutral event shape.
- [ ] Chạy test focused; expect những thất bại trong hợp đồng/policy.
- [ ] Thực hiện kết quả payment phân biệt đối xử: `SETTLED`, `UNDERPAID`, `OVERPAID_REVIEW`, `REJECTED`.
- [ ] Chạy test focused và `pnpm ci:verify`; expect pass.
- [ ] Commit: `feat: define payment provider contracts`.

**Tiêu chí chấp nhận:** Mã ứng dụng đặt chỗ có thể xử lý một sự kiện normalized mà không cần nhập các loại SePay.

### Task 5.2: Triển khai hướng dẫn SePay/ VietQR và xác minh webhook

**File:**
- Tạo: `src/features/payment/infrastructure/sepay/sepay-provider.ts`, `sepay-schema.ts`, `sepay-signature.ts`
- Tạo: `src/features/payment/infrastructure/sepay/vietqr.ts`
- Sửa: `.env.example`, `src/lib/env/server.ts`
- Kiểm thử: `src/features/payment/infrastructure/sepay/sepay-provider.test.ts`, `tests/fixtures/sepay-events.ts`

**Interface:**
- Triển khai `PaymentProvider` từ Task 5.1.
- Thêm khóa chỉ dành cho server theo yêu cầu của cơ chế webhook SePay hiện tại đã được xác minh và cấu hình ngân hàng/ VietQR.

- [ ] Tạo các lịch thi đấu đã ký cho các sự kiện hợp lệ, xác thực không hợp lệ, không đúng định dạng, sai số lượng, trùng lặp và không theo thứ tự mà không sử dụng secret thực sự.
- [ ] Chạy test provider; expect lỗi bộ điều hợp bị thiếu.
- [ ] Triển khai xác thực ranh giới Zod, xác minh tính xác thực, so sánh secret theo thời gian liên tục nếu có, phân tích tham chiếu truyền và hướng dẫn VietQR xác định.
- [ ] Chạy test provider; expect các yêu cầu không hợp lệ bị từ chối trước khi chuẩn hóa và lịch thi đấu hợp lệ được chuẩn hóa chính xác.
- [ ] Commit: `feat: add sepay payment adapter`.

**Tiêu chí chấp nhận:** Tải trọng webhook thô không đáng tin cậy cho đến khi được xác minh; thông tin đăng nhập và payload đầy đủ không bao giờ nhập log.

### Task 5.3: Xử lý webhooks một cách nguyên tử và idempotent

**File:**
- Tạo: `src/features/payment/application/process-payment-event.ts`
- Tạo: `src/features/payment/application/payment-repository.ts`, `src/features/payment/infrastructure/prisma-payment-repository.ts`
- Tạo: `src/app/api/payments/sepay/webhook/route.ts`
- Kiểm thử: `tests/integration/payment-webhook.test.ts`, `tests/integration/late-payment.test.ts`

**Interface:**
- Cung cấp: `processPaymentEvent(event: NormalizedPaymentEvent): Promise<PaymentEventResult>`
- Repository sử dụng `(provider, eventId)` duy nhất, khóa hàng để đặt/payment và khóa tư vấn room/ngày Task 3.4 để payment trễ.

- [ ] Viết các bài integration test cho trùng lặp/phát lại, phân phối trùng lặp đồng thời, ROOM_ONLY, ASSISTED, payment dưới/vượt mức, tham chiếu sai, slot không bị trễ và slot bị xung đột muộn.
- [ ] Chạy test focused; expect lỗi bộ xử lý/tuyến đường bị thiếu.
- [ ] Triển khai route được validate, chèn sổ cái sự kiện, khóa hàng/tư vấn giao dịch, thay đổi state so sánh và đặt, `refundStatus = REQUESTED` về xung đột muộn và response thành công nhanh chóng cho các bản sao.
- [ ] Chạy test webhook/payment trễ nhiều lần; expect một sự transition state và một ý định tác động phụ nguyên nhân cho mỗi sự kiện.
- [ ] Chạy `pnpm test:integration && pnpm ci:verify`; expect thoát `0`.
- [ ] Commit: `feat: process payment webhooks safely`.

**Tiêu chí chấp nhận:** Các webhooks trùng lặp không thể trùng lặp các transition; booking payment trễ không bao giờ trùng lặp với booking khác và không bao giờ làm mất hồ sơ payment.

### Task 5.4: Xây dựng trải nghiệm payment VietQR và làm mới state

**File:**
- Sửa: `src/app/booking/[id]/payment/page.tsx`, `src/app/booking/[id]/confirmation/page.tsx`
- Tạo: `src/features/payment/presentation/vietqr-payment.tsx`, `payment-status.tsx`
- Tạo: `src/features/payment/application/get-payment-view.ts`
- Kiểm thử: `src/features/payment/application/get-payment-view.test.ts`, `tests/e2e/room-only-payment.spec.ts`

**Interface:**
- Tạo `getPaymentView(actorOrGuest, bookingId)` trong phạm vi owner/token.
- Giao diện user thăm dò mô hình đọc an toàn với khoảng thời gian giới hạn và dừng ở state thiết bị đầu cuối hoặc ngắt kết nối.

- [ ] Viết E2E: guest tạo hold, thấy đúng deposit/reference/QR/countdown, fixture webhook được gửi, trang chuyển `CONFIRMED` và confirmation hiển thị remaining balance.
- [ ] Chạy test focused; expect lỗi giao diện user payment/mô hình đọc.
- [ ] Triển khai chế độ xem payment trên server, hành động sao chép, fallback chuyển khoản có thể truy cập/image QR, bỏ phiếu giới hạn, state hết hạn và notification rollback tiếng Việt.
- [ ] Chạy E2E trên thiết bị di động/máy tính để bàn và reduced motion; expect pass.
- [ ] Commit: `feat: complete room-only payment journey`.

**Tiêu chí chấp nhận:** User có thể hoàn tất payment mà không cần chỉ dựa vào quét QR; cập nhật state mà không làm lộ payload của provider hoặc token của khách.

### Task 5.5: Thêm hỗ trợ theo dõi xác nhận, hủy và refund

**File:**
- Tạo: `src/features/booking/application/confirm-assisted-booking.ts`, `cancel-booking.ts`
- Tạo: `src/features/payment/application/update-refund-status.ts`
- Sửa: `src/app/admin/bookings/[id]/page.tsx`, `src/app/admin/payments/page.tsx`, `src/app/account/bookings/[id]/page.tsx`
- Kiểm thử: `src/features/booking/application/confirm-assisted-booking.test.ts`, `cancel-booking.test.ts`, `src/features/payment/application/update-refund-status.test.ts`, `tests/e2e/assisted-lifecycle.spec.ts`

**Interface:**
- Cung cấp: `confirmAssistedBooking(admin, bookingId)`, `rejectAssistedBooking(admin, bookingId, reason)`
- Cung cấp: `cancelBooking(actor, bookingId, reason, now)` and `updateRefundStatus(admin, bookingId, status, note)`

- [ ] Viết các test về loại/state booking sai, không phải admin, xác nhận idempotent, ranh giới customer chính xác trong 24 giờ, ghi đè của admin, hủy đã payment/chưa payment, transition refund hợp lệ/không hợp lệ và metadata test.
- [ ] Chạy test focused; expect các trường hợp sử dụng bị thiếu.
- [ ] Triển khai các service so sánh và thiết lập được bảo vệ cũng như các biện pháp kiểm soát tối thiểu của admin/customer với hộp thoại xác nhận và thông tin input về lý do.
- [ ] Chạy test E2E unit và vòng đời được hỗ trợ; expect `PENDING → CONFIRMED`, customer từ chối trong vòng 24 giờ và quy trình test refund thủ công.
- [ ] Commit: `feat: manage assisted booking lifecycle`.

**Tiêu chí chấp nhận:** Mọi mutation trong vòng đời đều được server authorization, được test transition, idempotent và được test.

### Task 5.6: Thêm gửi notification qua email sau cam kết

**File:**
- Tạo: `src/features/notification/application/notification-service.ts`, `email-provider.ts`
- Tạo: `src/features/notification/infrastructure/resend-email-provider.ts`
- Tạo: `src/features/notification/presentation/email-templates.tsx`
- Sửa: booking/payment transition services to create notification intents after commit
- Kiểm thử: `src/features/notification/application/notification-service.test.ts`, `tests/integration/notification-idempotency.test.ts`

**Interface:**
- Cung cấp: `sendBookingNotification(intent): Promise<void>` with unique `(bookingId, eventType, causalEventId)`.
- Sự kiện email: `BOOKING_CREATED`, `PAYMENT_SUCCEEDED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, cộng với `LATE_PAYMENT_REVIEW` được yêu cầu theo hành vi thông số kỹ thuật.

- [ ] Viết test cho chủ đề/nội dung tiếng Việt, log người nhận bị che giấu, sự kiện nguyên nhân trùng lặp, thời gian chờ của provider, số lần thử lại có giới hạn và khả năng duy trì đăng ký/payment mặc dù không thành công.
- [ ] Chạy test focused; expect lỗi service/provider bị thiếu.
- [ ] Triển khai cổng/bộ transition của provider email, mẫu React, state log notification, intent idempotent và document lỗi bên ngoài các giao dịch domain.
- [ ] Chạy test unit/tích hợp với bộ điều hợp bị lỗi; expect cam kết booking/payment và notification được đánh dấu là không thành công.
- [ ] Commit: `feat: send resilient booking notifications`.

**Gate Phase 5:** Hành trình payment ROOM_ONLY và ASSISTED, webhook trùng lặp, payment trễ, hủy, theo dõi refund, lỗi notification và tích hợp thẻ xác nhận của admin/E2E.

---

# Phase 6 — Chất lượng production, khả năng quan sát và Vercel

**Kết quả:** Release gate đầy đủ, request correlation, structured log, Sentry, health/readiness, migration an toàn, Preview/Production workflow và production evidence.

**Điều kiện tiên quyết:** Phase 5 đã qua gate; tài nguyên production Vercel/Sentry/Supabase đã được cấu hình.

### Task 6.1: Thêm ngữ cảnh yêu cầu, log có cấu trúc và Sentry

**File:**
- Tạo: `src/features/observability/request-context.ts`, `logger.ts`, `redact.ts`
- Tạo/sửa đổi: Các tệp cấu hình server/máy khách/cạnh Sentry được yêu cầu bởi SDK đã cài đặt và `next.config.ts`
- Sửa: external route handlers and application error boundary
- Kiểm thử: `src/features/observability/redact.test.ts`, `logger.test.ts`, `tests/integration/request-correlation.test.ts`

**Interface:**
- Cung cấp: `withRequestContext(request, handler)`, `getRequestId()`, `logger.info/error(event, fields)`.
- Các trường log được phép bao gồm ID yêu cầu, SHA phát hành, module, ID thực thể an toàn; email/điện thoại/token/credential/webhook thô đã được chỉnh sửa lại.

- [ ] Viết các test chứa email, điện thoại, token truy cập, tiêu đề authorization, payload ngân hàng và nguyên nhân lỗi; assert output bị che và ID yêu cầu được giữ lại.
- [ ] Chạy test focused; expect các module quan sát bị thiếu.
- [ ] Triển khai bối cảnh yêu cầu AsyncLocalStorage, quy tắc tạo/tiêu đề đáng tin cậy, trình ghi log JSON, danh sách cho phép/xử lý đệ quy, lọc Sentry PII và phát hành gắn thẻ SHA.
- [ ] Chạy test unit/tích hợp và test log đã document; expect JSON hợp lệ không có secret lịch thi đấu.
- [ ] Commit: `feat: add production observability`.

**Tiêu chí chấp nhận:** Yêu cầu payment có thể được thực hiện trên toàn tuyến, service, test, log notification và Sentry bằng một ID yêu cầu mà không làm lộ PII.

### Task 6.2: Thực hiện test độ hoạt động, tính sẵn sàng và khói production

**File:**
- Tạo: `src/app/api/health/route.ts`, `src/app/api/ready/route.ts`
- Tạo: `scripts/smoke-production.mjs`
- Kiểm thử: `src/app/api/health/route.test.ts`, `src/app/api/ready/route.test.ts`

**Interface:**
- `/api/health` trả về state hoạt động của quy trình và release SHA mà không cần lệnh gọi phụ thuộc.
- `/api/ready` chạy `SELECT 1` bị giới hạn, trả về `503` khi bị lỗi và không bao giờ tiết lộ chi tiết kết nối.

- [ ] Viết các test route về state healthy, thời gian chờ DB, ngoại lệ DB, bản fallback SHA bị thiếu và tiêu đề bộ nhớ đệm response.
- [ ] Chạy test focused; expect sự thất bại của tuyến đường bị thiếu.
- [ ] Triển khai các tuyến đường và script khói để health check, mức độ sẵn sàng, nhà riêng, trường quay và tuyến đường công cộng/seed đã biết có thời gian chờ.
- [ ] Chạy test route và `node scripts/smoke-production.mjs http://localhost:3000` dựa trên build production local; expect tất cả các test đều pass.
- [ ] Commit: `feat: add health and readiness probes`.

**Tiêu chí chấp nhận:** Khả năng hoạt động vẫn ổn định trong thời gian ngừng hoạt động DB mô phỏng trong khi mức độ sẵn sàng nhanh chóng trả về `503`.

### Task 6.3: Hoàn thành ma trận CI và quy trình migration production

**File:**
- Sửa: `.github/workflows/ci.yml`, `package.json`
- Tạo: `scripts/migrate-production.mjs`, `docs/operations/vercel-runbook.md`, `docs/operations/incident-checklist.md`
- Sửa: `README.md`
- Kiểm thử: CI run plus migration test on an empty PostgreSQL database

**Interface:**
- Công việc CI: `quality`, `integration`, `e2e-critical`, `build`.
- Lệnh phát hành production: xác thực env → `prisma migrate deploy` với `DIRECT_URL` → triển khai SHA invariant → khói → đánh dấu phát hành.

- [ ] Tạo database mới và chạy lệnh migration production trước khi triển khai; xác nhận script vắng mặt không thành công.
- [ ] Triển khai script migration được bảo vệ từ chối xác nhận phi production hoặc thiếu URL trực tiếp, mở rộng CI với bộ nhớ đệm/tạo phẩm của trình duyệt Playwright và các quy tắc database production/xem trước tài liệu cũng như các quyết định rollback.
- [ ] Chạy migration hai lần trên database mới; expect lần đầu tiên áp dụng và lần thứ hai không hoạt động.
- [ ] Chạy ma trận CI local đầy đủ; expect tất cả các lệnh tương đương của job sẽ pass.
- [ ] Commit: `ci: complete release quality gates`.

**Tiêu chí chấp nhận:** Khối CI hợp nhất trên bất kỳ bộ quan trọng nào; quá trình migration có thể lặp lại và tách biệt khỏi quá trình khởi động ứng dụng.

### Task 6.4: Triển khai và xác minh MVP production Vercel

**File:**
- Chỉ sửa đổi cấu hình triển khai/tài liệu theo yêu cầu của liên kết dự án Vercel; không bao giờ cam kết các giá trị secret.
- Tạo: `docs/releases/mvp-release-checklist.md`
- Kiểm thử: Preview smoke, production smoke, uptime monitor, Sentry release event

**Interface:**
- Tiêu thụ tất cả các script Phase 6 và hợp đồng môi trường production.
- Tạo URL triển khai được document, phát hành SHA, phiên bản migration, chạy CI và bằng chứng khói trong danh sách test.

- [ ] Triển khai Bản xem trước với dữ liệu phi production giống như production và chạy các bước smoke test/Nhà viết kịch quan trọng đối với nó.
- [ ] Xác minh chính xác các URL chuyển hướng Supabase, lệnh callback Google OAuth, URL/auth webhook SePay, domain người gửi email và môi trường Sentry.
- [ ] Chạy migration production được bảo vệ và triển khai cùng một cam kết đã được xem xét SHA.
- [ ] Chạy khói production cộng với một vòng đời payment có giá trị thấp/chế độ test được kiểm soát; xác nhận mối tương quan yêu cầu và không có PII trong đo từ xa.
- [ ] Định cấu hình test thời gian hoạt động cho `/api/health` và trang chủ; document bằng chứng và thủ tục rollback.
- [ ] Commit: `docs: record mvp production release`.

**Gate Phase 6:** MowStudio hiện có trên Vercel; thẻ CI đầy đủ; migration, sức khỏe/sự sẵn sàng, Sentry, log, thời gian hoạt động, phát hành SHA và các hành trình quan trọng đã được document bằng chứng.

---

# Phase 7 — Visual polish và 3D hero tùy chọn

**Kết quả:** Một hệ thống image đặc biệt, dễ tiếp cận và một hero tiếp thị 3D được nâng cao dần dần mà không thể làm giảm khả năng sử dụng đặt chỗ.

**Điều kiện tiên quyết:** Cổng 6 đã qua. Đừng bắt đầu khi các lỗi chức năng vẫn còn trong route đăng ký quan trọng.

### Task 7.1: Thiết lập token trực quan và đánh bóng bề mặt 2D

**File:**
- Sửa: `src/app/globals.css`, shared shadcn theme/config, public and booking presentation components
- Tạo: `src/components/brand/brand-mark.tsx`, `src/components/brand/section-heading.tsx`
- Kiểm thử: `tests/e2e/visual-accessibility.spec.ts`, Playwright baseline screenshots under `tests/e2e/__screenshots__/`

**Interface:**
- Tạo các biến CSS cho màu sắc, kiểu chữ, không gian, bán kính, bóng và state tiêu điểm; các component tính năng sử dụng token thay vì bảng mã hóa cứng.

- [ ] Chụp ảnh màn hình cơ sở có chủ ý và chạy test khả năng truy cập tự động; document các lỗi hiện tại trước khi tạo kiểu.
- [ ] Triển khai hướng trực quan mạch lạc của studio sáng tạo, phân cấp response, state tải/trống/lỗi, tiêu điểm hiển thị, độ tương phản và mục tiêu cảm ứng mà không thay đổi giao diện domain.
- [ ] Chạy snapshot trực quan trên thiết bị di động/máy tính bảng/máy tính để bàn, hành trình đặt chỗ chỉ bằng bàn phím và test khả năng truy cập; chỉ phê duyệt những khác biệt có chủ ý.
- [ ] Chạy `pnpm ci:verify && pnpm test:e2e && pnpm build`; expect thoát `0`.
- [ ] Commit: `feat: polish mowstudio visual system`.

**Tiêu chí chấp nhận:** Đặt chỗ hoạt động hoàn toàn bằng bàn phím, tôn trọng chuyển động giảm và giữ lại thông tin state/giá/thời gian rõ ràng ở tất cả các chế độ xem.

### Task 7.2: Thêm hero tiếp thị 3D tiến bộ

**File:**
- Tạo: `src/features/marketing/presentation/studio-hero.tsx`, `studio-hero-canvas.tsx`, `studio-hero-fallback.tsx`
- Tạo: optimized assets under `public/3d/` only after license/size review
- Sửa: `src/app/page.tsx`
- Kiểm thử: `src/features/marketing/presentation/studio-hero.test.tsx`, `tests/e2e/hero-fallback.spec.ts`

**Interface:**
- Trình bao bọc server luôn hiển thị nội dung fallback có ý nghĩa; canvas của customer tải động sau khi test khả năng/viewport.
- Đầu vào: `prefers-reduced-motion`, pointer thô, viewport và khả năng WebGL; output không bao giờ chặn CTA/điều hướng.

- [ ] Viết test chứng minh fallback tĩnh không có JS/WebGL, chuyển động giảm thiểu sẽ vô hiệu hóa animation liên tục và CTA đặt trước tồn tại trước khi tải canvas.
- [ ] Chạy test focused; expect các component hero bị thiếu.
- [ ] Triển khai canvas React Three Fiber lazy, response pointer/cuộn tinh tế, xử lý/dọn dẹp, ranh giới lỗi và fallback tĩnh cho thiết bị di động/điện năng thấp.
- [ ] Đo lường việc xây dựng production trên cơ sở điều tiết di động đại diện; không yêu cầu hồi quy vượt quá ngân sách performance trang chủ đã thống nhất và không có tác động đến bundle route đặt chỗ.
- [ ] Chạy test hero, đặt chỗ quan trọng E2E, test build và bundle; expect pass.
- [ ] Commit: `feat: add progressive studio hero`.

**Gate Phase 7:** Bộ hồi quy image/accessibility đã pass; 3D là tùy chọn trong thời gian chạy, lazy, dùng một lần và không có trong bundle route đặt chỗ.

---

# Phase 8 — Triển khai DigitalOcean VM / DevOps về sau

**Kết quả:** Ứng dụng chạy bằng immutable container trên Ubuntu VM được harden, đặt sau Caddy, deploy từ GHCR và tự rollback khi health check thất bại.

**Điều kiện tiên quyết:** Phase 6 ổn định; chỉ kích hoạt credit sinh viên DigitalOcean 2–3 tháng trước khi nộp đơn CV; domain có sẵn trong Cloudflare.

### Task 8.1: Tạo và kiểm thử production container

**File:**
- Tạo: `Dockerfile`, `.dockerignore`, `compose.production.yml`
- Sửa: `next.config.ts`
- Tạo: `docs/operations/container-runbook.md`
- Kiểm thử: `tests/operations/container-smoke.sh`

**Interface:**
- Tạo image Next.js độc lập, nhiều phase, không phải gốc và được gắn thẻ bằng SHA cam kết đầy đủ.
- Container chỉ hiển thị cổng ứng dụng bên trong mạng compose và cung cấp các điểm cuối health/readiness.

- [ ] Viết script khói container expect UID không phải root, release SHA, health/readiness và không có yêu cầu về package manager/shell trong image cuối cùng.
- [ ] Xây dựng trước khi tồn tại các tệp Docker; xác nhận thất bại.
- [ ] Triển khai image nhiều phase, cài đặt pnpm xác định, tạo Prisma, output độc lập, hành vi bắt đầu/kết thúc và service compose production.
- [ ] Chạy quét lỗ hổng, test container, test dừng duyên dáng và test HTTP không có Caddy local; expect pass.
- [ ] Commit: `build: add production container image`.

**Tiêu chí chấp nhận:** Image được gắn thẻ SHA tương tự chạy local mà không cần gắn nguồn và tắt một cách nhẹ nhàng mà không mất dữ liệu.

### Task 8.2: Provision và harden VM runtime

**File:**
- Tạo: `deploy/Caddyfile`, `deploy/compose.vm.yml`, `deploy/scripts/bootstrap-ubuntu.sh`, `deploy/scripts/backup-postgres-metadata.sh`
- Tạo: `docs/operations/vm-bootstrap.md`, `docs/operations/restore-drill.md`
- Kiểm thử: manual disposable-VM checklist plus Caddy config validation

**Interface:**
- Caddy chỉ hiển thị cổng 80/443; ứng dụng vẫn ở chế độ riêng tư.
- Secret thời gian chạy tồn tại trong các tệp môi trường server sở hữu gốc; user triển khai chỉ có thể vận hành stack compose ứng dụng.

- [ ] Xác thực script khởi động trong VM Ubuntu dùng một lần và document các cổng/user mở ban đầu trước khi thay đổi.
- [ ] Triển khai user triển khai không phải root, quyền truy cập chỉ bằng khóa SSH, firewall, cập nhật bảo mật tự động, Docker/Compose, log rotation, Caddy TLS/reverse proxy, quyền secret bị hạn chế và quy trình metadata sao lưu.
- [ ] Xác thực cấu hình Caddy, TLS bên ngoài, firewall, khả năng khởi động lại liên tục, giới hạn đĩa/log và bản diễn tập rollback được document.
- [ ] Commit: `ops: add hardened vm runtime`.

**Tiêu chí chấp nhận:** Service tự hoạt động lại sau reboot; bên ngoài chỉ truy cập được SSH/HTTP/HTTPS; secret và app port không public.

### Task 8.3: Tự động triển khai và rollback GHCR

**File:**
- Tạo: `.github/workflows/deploy-vm.yml`
- Tạo: `deploy/scripts/deploy.sh`, `deploy/scripts/rollback.sh`
- Tạo: `docs/operations/vm-deployment.md`
- Kiểm thử: deployment to staging/disposable VM, forced unhealthy release rollback

**Interface:**
- Quy trình làm việc xây dựng/ký hoặc chứng thực image SHA, đẩy GHCR, kết nối với khóa SSH trong phạm vi hẹp, triển khai candidate, test `/api/ready` và document SHA trước đó.
- `deploy.sh <sha>` là idempotent; `rollback.sh <sha>` khôi phục chính xác image SHA được chỉ định.

- [ ] Viết khai thác test vỏ với image có chủ ý unhealthy và expect ​​sẽ tự động rollback SHA trước đó.
- [ ] Chạy khai thác trước khi có script; xác nhận thất bại.
- [ ] Triển khai quy trình làm việc được bảo vệ đồng thời, đăng nhập GHCR với privilege tối thiểu, kéo image, cổng migration, khởi động candidate, thử lại mức độ sẵn sàng bị giới hạn, quay lui tự động và tóm tắt triển khai.
- [ ] Triển khai một candidate healthy hai lần; expect sự thành công idempotent. Triển khai candidate unhealthy; expect SHA được rollback trước đó và quy trình làm việc thất bại rõ ràng.
- [ ] Commit: `ci: automate vm deployment rollback`.

### Task 8.4: Cắt DNS Cloudflare và hoàn thành bằng chứng hoạt động

**File:**
- Sửa: `docs/operations/vm-deployment.md`, `docs/releases/vm-release-checklist.md`
- Kiểm thử: DNS/TLS, uptime, rollback, backup/restore, webhook reachability, Sentry release

**Interface:**
- Cloudflare DNS trỏ domain đã chọn vào VM; chế độ proxy/TLS được document và tương thích với Caddy.

- [ ] Hạ TTL DNS trước khi transition và xác minh rằng quá trình production Vercel vẫn có sẵn làm mục tiêu rollback.
- [ ] Cắt DNS, xác minh TLS và URL callback/webhook, sau đó chạy Playwright quan trọng và smoke test đối với domain công cộng.
- [ ] Thực hiện và document một deployment rollback cùng một restore drill; xác nhận monitoring alert và release correlation.
- [ ] Tăng TTL sau khoảng thời gian quan sát và document ngày hết hạn chi phí/credit.
- [ ] Commit: `docs: record vm production cutover`.

**Gate Phase 8:** Public VM deployment, TLS, image provenance, least-privilege SSH, health rollback, backup/restore, monitoring và release evidence đều được chứng minh; Vercel rollback path được document.

---

## Ma trận kiểm chứng cuối cùng

Chạy sau Phase 6 cho MVP và lặp lại sau Phase 7/8 khi áp dụng:

```bash
pnpm install --frozen-lockfile
pnpm prisma validate
pnpm ci:verify
pnpm test:integration
pnpm test:e2e
pnpm build
node scripts/smoke-production.mjs "$DEPLOYMENT_URL"
```

Kết quả mong đợi:

- mọi lệnh đều thoát `0`;
- bộ đồng thời báo cáo chính xác một người chiến thắng cho mỗi cuộc đua cùng một slot;
- tính năng phát lại webhook tạo ra một quá trình transition và một intent notification nguyên nhân;
- guest không có token bị từ chối; customer truy cập booking của account khác cũng bị từ chối;
- non-admin bị từ chối ở cả admin route và mutation;
- ROOM_ONLY kết thúc `CONFIRMED`; ASSISTED kết thúc `PENDING` cho đến khi có xác nhận của admin;
- Customer hủy đúng 24h thành công và dưới 24h không thành công;
- health không phụ thuộc DB; readiness trả lỗi an toàn khi DB outage;
- production response/log/Sentry context chứa release SHA và request ID, đồng thời mask PII.

## Checklist quản lý phase

Với mỗi phase:

- [ ] Xác nhận toàn bộ prerequisite gate của phase đã xanh.
- [ ] Chỉ mở task kế tiếp; không chạy song song các task dùng chung schema/interface.
- [ ] Giữ nguyên thay đổi không liên quan của user và kiểm tra worktree trước khi sửa.
- [ ] Tuân theo failing-test-first sequence của từng task.
- [ ] Review diff để tìm secret, PII, provider payload và scope expansion ngoài ý muốn.
- [ ] Chạy các test focused, sau đó là bộ test rộng hơn theo yêu cầu của từng phase.
- [ ] Chỉ tạo conventional commit của task sau khi verification pass.
- [ ] Ghi gate evidence trước khi đánh dấu phase hoàn thành.
- [ ] Cập nhật design spec trước nếu product decision hoặc domain invariant thay đổi.

## Định nghĩa hoàn tất

Kế hoạch đạt functional production MVP tại Phase 6. Phase 7 là portfolio polish. Phase 8 là phần trình diễn DevOps về sau, không được trì hoãn Vercel MVP hoặc làm kích hoạt student credit quá sớm.
