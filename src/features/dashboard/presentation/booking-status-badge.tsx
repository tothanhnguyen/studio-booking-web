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
  PENDING_PAYMENT: "border-[#c7a85c] bg-[#f0e0b8] text-[#6e4f16]",
  PENDING: "border-[#9ab7bd] bg-[#d7e4e7] text-[#315a66]",
  CONFIRMED: "border-[#9aba9f] bg-[#d8e5db] text-[#2f5d46]",
  CANCELLED: "border-[#c9938b] bg-[#efd8d4] text-[#8b3e35]",
  EXPIRED: "border-[#c9c0b6] bg-[#e3ded6] text-[#57534e]",
  COMPLETED: "border-[#b6a3bd] bg-[#e1d9e6] text-[#594461]",
};

export function BookingStatusBadge({ status }: Readonly<{ status: BookingStatus }>) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

export function getBookingStatusLabel(status: BookingStatus) {
  return statusLabels[status];
}
