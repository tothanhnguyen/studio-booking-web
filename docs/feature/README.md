# Hướng dẫn chỉnh sửa chức năng

Mỗi file mô tả một vùng nghiệp vụ. Các guide ghi rõ ranh giới giữa thay đổi hiển thị và thay đổi dữ liệu/policy.

## Danh mục

- [`home-hero-and-scroll-media.md`](./home-hero-and-scroll-media.md) — copy, animation và chuỗi 96 frame hero.
- [`studio-rooms-and-images.md`](./studio-rooms-and-images.md) — phòng, slug và mapping ảnh.
- [`services-and-pricing.md`](./services-and-pricing.md) — dịch vụ, giá, thời lượng và buffer.
- [`availability-and-schedule.md`](./availability-and-schedule.md) — giờ mở cửa, block và slot 15 phút.
- [`booking-flow-and-lifecycle.md`](./booking-flow-and-lifecycle.md) — wizard, hold và trạng thái booking.
- [`authentication-and-roles.md`](./authentication-and-roles.md) — Supabase, xác minh email, CUSTOMER/ADMIN.
- [`guest-bookings-and-claim.md`](./guest-bookings-and-claim.md) — quyền guest và nhận booking theo email.
- [`payments-sepay-and-refunds.md`](./payments-sepay-and-refunds.md) — QR, webhook, tiền cọc và hoàn tiền.
- [`customer-account.md`](./customer-account.md) — danh sách, chi tiết và hủy booking của khách.
- [`admin-operations.md`](./admin-operations.md) — catalog, booking, lịch và tài chính.
- [`notifications-and-email.md`](./notifications-and-email.md) — Resend, template và idempotency.
- [`observability-and-errors.md`](./observability-and-errors.md) — log, request ID, Sentry, health/readiness.

## Cách dùng

1. Đọc “Ranh giới thay đổi” trước khi sửa.
2. Xác nhận mọi path vẫn tồn tại bằng `test -f <path>`.
3. Làm theo “Cách sửa an toàn”.
4. Chạy đúng test trong phần “Xác minh”.

Quay lại [sổ tay chính](../editing-guide.md) hoặc xem [hướng dẫn UI theo trang](../ui/README.md).
