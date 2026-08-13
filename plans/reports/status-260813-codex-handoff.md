# Trạng thái Codex — hoàn tất công việc dở ngày 2026-08-13

## Kết luận

Phần việc Codex đang làm dở đã được hoàn tất và xác nhận qua đầy đủ quality gate,
production build, PostgreSQL integration và Playwright desktop/mobile.

Thay đổi hiện tại chỉ làm ổn định type generation và smoke test. Không thay đổi
logic booking/payment, database schema, route hay giao diện.

## Vấn đề đã xử lý

### 1. `next-env.d.ts` liên tục làm worktree dirty

Commit `19afdcb phase test e2e` trước đó thực tế chỉ đổi đường dẫn route type trong
file do Next.js tự sinh:

```text
./.next/dev/types/routes.d.ts -> ./.next/types/routes.d.ts
```

`next dev` có thể ghi lại đường dẫn dev, còn typegen/build ghi đường dẫn production,
nên file này thay đổi qua lại dù không có sửa code.

Đã hoàn tất:

- Thêm `next-env.d.ts` vào `.gitignore`.
- Bỏ `next-env.d.ts` khỏi Git index.
- Thêm `next typegen` vào `ci:verify` trước TypeScript.
- Xác nhận sau `ci:verify` và `next build`, Next vẫn tự sinh file cục bộ nhưng
  `git status` không còn báo dirty.

Hướng này phù hợp tài liệu đi kèm Next.js 16: `next-env.d.ts` là declaration file tự
sinh và không nên được track bởi version control.

### 2. Smoke test phụ thuộc quyền mở socket

`src/features/observability/smoke-production.test.ts` trước đây dựng một HTTP server
với `server.listen(0)` chỉ để giả lập response cho `fetch`. Trong môi trường không
cho bind socket, test timeout với:

```text
listen EPERM: operation not permitted 0.0.0.0
```

Đã hoàn tất:

- Bỏ HTTP server khỏi unit test.
- Mock global `fetch` bằng Vitest.
- Trả `Response` theo pathname, bao gồm response 404 cho route không khai báo.
- Reset global mock sau mỗi test bằng `vi.unstubAllGlobals()`.
- Giữ nguyên contract cần kiểm: `/api/health` fail khi `releaseSha === "unknown"`.

## File thay đổi

- `.gitignore`
- `package.json`
- `next-env.d.ts` — xóa khỏi Git index; Next vẫn tự sinh cục bộ.
- `src/features/observability/smoke-production.test.ts`
- `plans/reports/status-260813-codex-handoff.md`

Các thay đổi hiện chưa commit.

Sau khi xác nhận xong, hai production server thử nghiệm đã được dừng và PostgreSQL
test container đã được stop. Dữ liệu test vẫn được giữ trong Docker volume để có thể
chạy tiếp mà không cần seed lại nếu schema không đổi.

## Kết quả xác nhận

### Quality gate

Lệnh:

```bash
corepack pnpm ci:verify
```

Kết quả:

- Prisma generate: pass.
- Next typegen: pass.
- ESLint: 0 error.
- ESLint còn 2 warning cũ trong test fixture dùng `<img>`:
  - `src/components/ui/crop-frame.test.tsx`
  - `src/components/ui/parallax-frame.test.tsx`
- TypeScript: pass.
- Vitest: **62 test files, 189 tests passed**.
- Smoke production test riêng: **2/2 passed**.

### Production build

Lệnh:

```bash
corepack pnpm build
```

Kết quả: **pass**.

- Next.js 16.2.10 / Turbopack compile thành công.
- TypeScript pass.
- Static page generation pass.
- Toàn bộ 26 app routes được tạo.
- Ba Google Fonts được đóng gói thành `.woff2` trong build output.

Lỗi tải Google Fonts ở lượt trước chỉ do network sandbox lúc đó bị chặn. Khi network
được mở, build hoàn tất mà không cần sửa font hoặc layout.

### PostgreSQL và integration

Đã thực hiện:

```bash
docker compose -f docker-compose.test.yml up -d --wait
corepack pnpm prisma migrate deploy
corepack pnpm prisma db seed
corepack pnpm test:integration
```

Kết quả:

- PostgreSQL 18 test container: healthy.
- Migration `20260703131021_initial_domain`: applied.
- Seed: pass.
- Integration: **15 test files, 29 tests passed**.

### Route smoke trên production server

Production server chạy với test DB tại `http://127.0.0.1:3100`.

| Route | Kết quả |
| --- | --- |
| `/api/health` | 200 |
| `/api/ready` | 200 |
| `/` | 200 |
| `/studios` | 200 |
| `/studios/photo-studio` | 200 |
| `/services/photo-room-rental` | 200 |
| `/login` | 200 |
| `/register` | 200 |
| `/admin` khi chưa đăng nhập | 307 tới `/login?next=/admin` |

`/api/health` trả `releaseSha: "unknown"` ở local là mong đợi vì local không có release
SHA. Production smoke script cố ý coi giá trị này là fail khi kiểm deployment thật.

### Playwright E2E

Critical suite:

```text
8 passed
```

Full suite trên Chromium desktop và Pixel 7 mobile:

```text
46 passed
4 skipped
0 failed
```

Bốn test skip là các skip theo project đã khai báo sẵn, gồm desktop-only/mobile-only
hero cases và hai admin mutation flows không chạy lặp trên mobile. Reduced-motion,
public catalog, auth, booking, payment, claim, admin denial, admin dashboard và assisted
lifecycle đều pass.

## Trạng thái Git bàn giao

Nhánh: `tnguyen-29/7`.

HEAD:

```text
19afdcb phase test e2e
```

Thay đổi có chủ đích đang chờ review/commit:

```text
M  .gitignore
M  package.json
D  next-env.d.ts
M  src/features/observability/smoke-production.test.ts
?? plans/reports/status-260813-codex-handoff.md
```

`next-env.d.ts` vẫn tồn tại trong filesystem dưới dạng ignored generated file; ký hiệu
`D` chỉ có nghĩa là file sẽ được bỏ khỏi repository ở commit kế tiếp.

`git diff --check`: sạch.

## Việc có thể cân nhắc làm tiếp

Các mục dưới đây không chặn thay đổi hiện tại:

1. Review diff và commit với tên:
   `test: stabilize generated types and smoke checks`.
2. Hai warning `<img>` nằm trong test fixture có thể bỏ qua hoặc xử lý trong một
   cleanup riêng; production component không dùng hai thẻ này.
3. Có thể chuyển từ `next/font/google` sang `next/font/local` nếu yêu cầu build hoàn
   toàn offline. Hiện build bình thường đã xanh và font đã được Next đóng gói.
4. Trước release thật, đặt `NEXT_PUBLIC_RELEASE_SHA`/Vercel SHA và chạy:
   `corepack pnpm smoke:production https://<deployment-url>`.
5. Nếu tiếp tục phát triển E2E với DB dùng lâu dài, nên reset/reseed trước mỗi full
   suite để tránh fixture date bị tích lũy booking qua nhiều lượt.

## Tiêu chí hoàn tất

- [x] Không còn dirty giả do `next-env.d.ts`.
- [x] Smoke unit test không cần mở socket.
- [x] Quality gate xanh.
- [x] Production build xanh.
- [x] PostgreSQL migration/seed xanh.
- [x] Integration xanh.
- [x] Critical E2E xanh.
- [x] Full desktop/mobile E2E xanh.
- [x] Route smoke chính trả đúng status.
- [x] Báo cáo trạng thái được cập nhật.
