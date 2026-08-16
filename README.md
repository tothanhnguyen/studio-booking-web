# Hệ Thống Đặt Phòng Mow Studio (Mow Studio Booking Web)

Chào mừng bạn đến với hệ thống đặt phòng chụp ảnh của **Mow Studio**! Đây là một nền tảng web hiện đại được thiết kế nhằm mang lại trải nghiệm mượt mà và tiện lợi nhất cho khách hàng có nhu cầu thuê phòng, đồng thời cung cấp các công cụ quản lý mạnh mẽ cho đội ngũ vận hành.

---

## Tính Năng Nổi Bật

Dự án được chia thành các nhóm tính năng chuyên biệt, tối ưu hóa cho cả trải nghiệm của người dùng (Customer) và quản trị viên (Admin).

### Trải Nghiệm Khách Hàng (Customer)
*   **Giao Diện Hiện Đại, Trực Quan:** Trang chủ nổi bật với các hình ảnh và nội dung chất lượng cao (Home Hero & Scroll Media), giúp khách hàng dễ dàng hình dung không gian studio.
*   **Quy Trình Đặt Phòng Tối Ưu (Booking Flow):** Trải nghiệm các bước đặt phòng (wizard) liền mạch, từ việc chọn phòng, xem chi tiết dịch vụ cho đến bước thanh toán và xác nhận cuối cùng.
*   **Hỗ Trợ Khách Vãng Lai (Guest Bookings):** Cho phép đặt phòng nhanh chóng không cần đăng ký tài khoản. Khách hàng cũng có thể nhận lại (claim) lịch sử đặt phòng nếu tạo tài khoản sau đó.
*   **Quản Lý Tài Khoản (Customer Account):** Người dùng có thể xem lại danh sách các lịch đặt phòng và quản lý thông tin tài khoản cá nhân.
*   **Thanh Toán Tự Động (Payments & Refunds):** Tích hợp cổng thanh toán **SePay** giúp xác nhận giao dịch nhanh chóng và hỗ trợ quy trình hoàn tiền (refund).
*   **Hệ Thống Thông Báo (Notifications):** Gửi email thông báo tự động để cập nhật trạng thái đặt phòng cho khách hàng.

### Quản Trị & Vận Hành (Admin)
*   **Quản Lý Lịch Trình (Schedule & Availability):** Giám sát lịch trống, chặn lịch (blocked slots) và theo dõi toàn bộ các ca đặt phòng thông qua giao diện lịch trực quan.
*   **Quản Lý Cơ Sở Vật Chất (Rooms & Services):** Thêm, sửa thông tin về các phòng chụp, hình ảnh minh họa, cũng như tùy chỉnh cấu hình dịch vụ và bảng giá.
*   **Quản Lý Giao Dịch & Đặt Phòng:** Bảng điều khiển (Dashboard) giúp admin theo dõi tổng quan các lịch đặt, quản lý giao dịch thanh toán và các hoạt động vận hành khác.
*   **Phân Quyền & Bảo Mật (Authentication & Roles):** Hệ thống phân quyền chặt chẽ, đảm bảo an toàn dữ liệu và quyền truy cập của đội ngũ quản trị.
*   **Giám Sát Hệ Thống (Observability):** Ghi nhận và theo dõi lỗi (errors) để đảm bảo nền tảng hoạt động ổn định và xuyên suốt.

---

## Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các nền tảng và công cụ hiện đại, mang lại hiệu suất cao:

*   **Frontend & Framework:** Sử dụng **Next.js** làm framework cốt lõi cùng với ngôn ngữ **TypeScript** giúp tối ưu hiệu năng và quản lý mã nguồn chặt chẽ.
*   **Cơ Sở Dữ Liệu:** Ứng dụng **Prisma** (ORM) để tương tác, thiết kế cấu trúc dữ liệu và quản lý cơ sở dữ liệu một cách an toàn.
*   **Tích Hợp API:** Xử lý thanh toán tự động qua hệ thống **SePay**.
*   **Kiểm Thử (Testing):** Sử dụng **Playwright** để kiểm thử tự động toàn diện (E2E), đảm bảo giao diện và luồng tính năng hoạt động chính xác.
*   **Môi Trường & Công Cụ Khác:** Hỗ trợ cấu hình môi trường test thông qua **Docker** và sử dụng **ESLint** để chuẩn hóa chất lượng mã nguồn.
