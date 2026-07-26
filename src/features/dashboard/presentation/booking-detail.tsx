import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

/**
 * Booking detail body — task-priority sections (01 Lịch studio, 02 Thanh toán,
 * 03 Chính sách). Desktop splits into a content column (8) carrying the
 * schedule task and a meta column (4) stacking payment + policy as auxiliary
 * reading; mobile stacks both columns in the same numeric order. The page
 * shell (account/admin) owns the header row and any lifecycle actions.
 */
export function BookingDetail({ booking, showCustomer = false }: Readonly<{ booking: DashboardBooking; showCustomer?: boolean }>) {
  return (
    <div className="account-detail-sections">
      <div className="account-detail-content">
        <ScrollReveal>
          <section aria-label="Lịch studio" className="account-detail-section">
            <div className="account-detail-schedule-head">
              <SectionMarker index={1} label="Lịch studio" />
              <BookingStatusBadge status={booking.bookingStatus} />
            </div>
            <dl className="account-detail-fields">
              <div>
                <dt>Dịch vụ</dt>
                <dd>{booking.serviceName}</dd>
              </div>
              <div>
                <dt>Phòng</dt>
                <dd>{booking.roomName}</dd>
              </div>
              <div>
                <dt>Bắt đầu</dt>
                <dd><time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time></dd>
              </div>
              <div>
                <dt>Kết thúc</dt>
                <dd><time dateTime={booking.endTime}>{formatStudioDateTime(booking.endTime)}</time></dd>
              </div>
            </dl>
          </section>
        </ScrollReveal>

        {showCustomer && (
          <ScrollReveal delayMs={60}>
            <section aria-label="Thông tin khách hàng" className="account-detail-section">
              <h2 className="account-detail-subheading">Thông tin khách hàng</h2>
              <p className="account-detail-customer">
                {booking.customerName} · {booking.customerEmail}
                {booking.customerPhone ? ` · ${booking.customerPhone}` : ""}
              </p>
              {booking.note && <p className="account-detail-note">Ghi chú: {booking.note}</p>}
            </section>
          </ScrollReveal>
        )}
      </div>

      <aside className="account-detail-meta">
        <ScrollReveal delayMs={80}>
          <section aria-label="Thanh toán" className="account-detail-section">
            <SectionMarker index={2} label="Thanh toán" />
            <dl className="account-detail-fields">
              <div>
                <dt>Tổng tiền</dt>
                <dd>{currency.format(booking.subtotalAmount)}</dd>
              </div>
              <div>
                <dt>Tiền cọc</dt>
                <dd>{currency.format(booking.depositAmount)}</dd>
              </div>
              <div>
                <dt>Còn lại</dt>
                <dd>{currency.format(booking.remainingAmount)}</dd>
              </div>
              <div>
                <dt>Trạng thái thanh toán</dt>
                <dd>{booking.paymentStatus}</dd>
              </div>
              <div>
                <dt>Trạng thái hoàn tiền</dt>
                <dd>{booking.refundStatus}</dd>
              </div>
            </dl>
          </section>
        </ScrollReveal>

        <ScrollReveal delayMs={140}>
          <section aria-label="Chính sách" className="account-detail-section">
            <SectionMarker index={3} label="Chính sách" />
            <ul className="account-detail-policy">
              <li>Yêu cầu hủy được gửi qua biểu mẫu bên dưới; MowStudio xác nhận thay đổi trạng thái qua email.</li>
              <li>Trạng thái hoàn tiền được cập nhật ở mục Thanh toán khi yêu cầu được xử lý.</li>
              <li>Cần đổi lịch hoặc có thắc mắc? Liên hệ đội ngũ MowStudio để được hỗ trợ.</li>
            </ul>
          </section>
        </ScrollReveal>
      </aside>
    </div>
  );
}
