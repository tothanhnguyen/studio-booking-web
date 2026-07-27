import type { BookingStatus } from "@/features/booking/domain/booking-types";

const statusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  COMPLETED: "Đã hoàn thành",
};

const statusTones: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "pending-payment",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  COMPLETED: "completed",
};

// LED-style status: a small tone dot beside the localized label — the dot is
// never the sole signal, the label text carries its own color too. Tones
// mirror the previous pill's WCAG AA-verified text colors (>= 4.5:1 against
// var(--color-surface)); see proof-admin.css .console-status for the palette.
export function BookingStatusBadge({ status }: Readonly<{ status: BookingStatus }>) {
  return (
    <span className="console-status" data-tone={statusTones[status]}>
      <span aria-hidden="true" className="console-status__dot" />
      <span className="console-status__label">{statusLabels[status]}</span>
    </span>
  );
}

export function getBookingStatusLabel(status: BookingStatus) {
  return statusLabels[status];
}
