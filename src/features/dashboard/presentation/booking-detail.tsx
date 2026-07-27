import type { ReactNode } from "react";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";

// Admin gets no scroll-reveal choreography (Global Constraint: "no parallax/
// marquee/scroll-reveal" on admin surfaces) — a plain passthrough wrapper
// keeps the section markup identical without the reveal transition.
function PlainSection({ children }: Readonly<{ children: ReactNode; delayMs?: number }>) {
  return <>{children}</>;
}

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const paymentStatusLabel: Record<string, string> = {
  PENDING: "Đang chờ",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  EXPIRED: "Hết hạn",
};

const refundStatusLabel: Record<string, string> = {
  NONE: "Không có",
  REQUESTED: "Đã yêu cầu",
  PROCESSING: "Đang xử lý",
  REFUNDED: "Đã hoàn tiền",
  REJECTED: "Đã từ chối",
};

/**
 * Booking detail body — task-priority sections (01 Lịch studio, 02 Thanh toán,
 * 03 Chính sách). Desktop splits into a content column (8) carrying the
 * schedule task and a meta column (4) stacking payment + policy as auxiliary
 * reading; mobile stacks both columns in the same numeric order. The page
 * shell (account/admin) owns the header row and any lifecycle actions.
 *
 * `variant="admin"` renders the same fields inline within the admin page's own
 * numbered section: no nested SectionMarkers, no cancellation-policy blurb,
 * and flat (borderless) sections to avoid doubling the admin section's own
 * hairline. `variant="account"` (default) is unchanged.
 */
export function BookingDetail({
  booking,
  showCustomer = false,
  variant = "account",
}: Readonly<{ booking: DashboardBooking; showCustomer?: boolean; variant?: "account" | "admin" }>) {
  const isAdmin = variant === "admin";
  const sectionClassName = isAdmin ? "account-detail-section-flat" : "account-detail-section";
  const Reveal = isAdmin ? PlainSection : ScrollReveal;

  return (
    <div className="account-detail-sections">
      <div className="account-detail-content">
        <Reveal>
          <section aria-label="Lịch studio" className={sectionClassName}>
            <div className="account-detail-schedule-head">
              {!isAdmin && <SectionMarker index={1} label="Lịch studio" />}
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
        </Reveal>

        {showCustomer && (
          <Reveal delayMs={60}>
            <section aria-label="Thông tin khách hàng" className={sectionClassName}>
              <h2 className="account-detail-subheading">Thông tin khách hàng</h2>
              <p className="account-detail-customer">
                {booking.customerName} · {booking.customerEmail}
                {booking.customerPhone ? ` · ${booking.customerPhone}` : ""}
              </p>
              {booking.note && <p className="account-detail-note">Ghi chú: {booking.note}</p>}
            </section>
          </Reveal>
        )}
      </div>

      <aside className="account-detail-meta">
        <Reveal delayMs={80}>
          <section aria-label="Thanh toán" className={sectionClassName}>
            {!isAdmin && <SectionMarker index={2} label="Thanh toán" />}
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
                <dd>{paymentStatusLabel[booking.paymentStatus] ?? booking.paymentStatus}</dd>
              </div>
              <div>
                <dt>Trạng thái hoàn tiền</dt>
                <dd>{refundStatusLabel[booking.refundStatus] ?? booking.refundStatus}</dd>
              </div>
            </dl>
          </section>
        </Reveal>

        {!isAdmin && (
          <Reveal delayMs={140}>
            <section aria-label="Chính sách" className={sectionClassName}>
              <SectionMarker index={3} label="Chính sách" />
              <ul className="account-detail-policy">
                <li>Yêu cầu hủy được gửi qua biểu mẫu bên dưới; MowStudio xác nhận thay đổi trạng thái qua email.</li>
                <li>Trạng thái hoàn tiền được cập nhật ở mục Thanh toán khi yêu cầu được xử lý.</li>
                <li>Cần đổi lịch hoặc có thắc mắc? Liên hệ đội ngũ MowStudio để được hỗ trợ.</li>
              </ul>
            </section>
          </Reveal>
        )}
      </aside>
    </div>
  );
}
