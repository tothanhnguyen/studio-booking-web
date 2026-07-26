# Sổ tay tự chỉnh sửa MowStudio

Tài liệu này chỉ đúng với code hiện tại. Bắt đầu ở đây, sau đó mở đúng một hướng dẫn trong [`feature/`](./feature/README.md) hoặc [`ui/`](./ui/README.md).

## Chọn nơi cần sửa

| Bạn muốn đổi | Mở tài liệu |
|---|---|
| Màu, font, khoảng cách toàn site | [`ui/shared-theme-and-layout.md`](./ui/shared-theme-and-layout.md) |
| Nút, card, input dùng chung | [`ui/shared-components-and-forms.md`](./ui/shared-components-and-forms.md) |
| Copy hoặc bố cục một trang | Chọn trang trong [`ui/README.md`](./ui/README.md) |
| Ảnh phòng hoặc 96 frame hero | [`feature/studio-rooms-and-images.md`](./feature/studio-rooms-and-images.md), [`feature/home-hero-and-scroll-media.md`](./feature/home-hero-and-scroll-media.md) |
| Giá, lịch, booking, payment, quyền | Chọn nghiệp vụ trong [`feature/README.md`](./feature/README.md) |

## Cây quyết định

1. Chỉ đổi chữ hiển thị hoặc class/CSS? Đây là **UI-only**; không sửa schema, repository hoặc policy.
2. Giá trị đến từ database? Sửa trong admin; seed chỉ là dữ liệu khởi tạo/dev.
3. Thay đổi trạng thái, tiền cọc, quyền hoặc khả dụng? Đây là **business/data**; đọc guide feature và chạy test liên quan.
4. Đổi slug phòng? Đồng bộ `hero-copy.ts`, `site-footer.tsx`, `room-visual.tsx`, `prisma/seed.ts` và test.
5. Không chắc dữ liệu đến từ đâu? Tìm trước bằng `rg`:

```bash
rg -n "đoạn chữ hoặc tên biến" src prisma
```

## Quy trình sửa an toàn

1. Tạo một thay đổi nhỏ, không đổi UI và nghiệp vụ cùng lúc.
2. Chạy `npm run dev`, mở route ghi trong guide và kiểm tra desktop/mobile.
3. Chạy kiểm tra tối thiểu:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

4. Với database/API/payment, chạy thêm `npm run test:integration`; với hành trình trình duyệt, chạy `npm run test:e2e` hoặc file Playwright được nêu trong guide.

## Quy ước quan trọng

- Múi giờ vận hành: `Asia/Ho_Chi_Minh`.
- `/booking/[id]` dùng **service ID**; sau khi tạo hold, `/booking/[id]/payment` dùng **booking ID**.
- Payment và confirmation của guest cần cookie HTTP-only theo booking.
- QR được tạo lúc chạy từ cấu hình SePay/VietQR, không phải ảnh tĩnh.
- Không đổi dòng “cọc 30%” riêng ở UI: công thức thật nằm trong `src/lib/money/vnd.ts`.
- Không đưa secret thật vào `.env.example`, tài liệu hoặc Git.

## Trước khi kết thúc

```bash
git diff --check
git status --short
```

Chỉ stage đúng file bạn chủ động sửa; không dùng lệnh reset để xóa thay đổi chưa biết nguồn gốc.
