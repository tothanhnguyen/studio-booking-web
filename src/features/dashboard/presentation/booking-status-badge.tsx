import type { BookingStatus } from "@/features/booking/domain/booking-types";

const statusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  COMPLETED: "Đã hoàn thành",
};

const statusStyles: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  PENDING: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  CONFIRMED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  CANCELLED: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  EXPIRED: "border-stone-400/30 bg-stone-400/10 text-stone-300",
  COMPLETED: "border-violet-300/30 bg-violet-300/10 text-violet-200",
};

export function BookingStatusBadge({ status }: Readonly<{ status: BookingStatus }>) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

export function getBookingStatusLabel(status: BookingStatus) {
  return statusLabels[status];
}
