import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function BookingDetail({ booking, showCustomer = false }: Readonly<{ booking: DashboardBooking; showCustomer?: boolean }>) {
  return <div className="mt-6 grid gap-4 md:grid-cols-2">
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Lịch studio</h2><BookingStatusBadge status={booking.bookingStatus} /></div>
      <dl className="mt-4 grid gap-3 text-sm">
        <div><dt className="text-stone-400">Dịch vụ</dt><dd>{booking.serviceName}</dd></div>
        <div><dt className="text-stone-400">Phòng</dt><dd>{booking.roomName}</dd></div>
        <div><dt className="text-stone-400">Bắt đầu</dt><dd><time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time></dd></div>
        <div><dt className="text-stone-400">Kết thúc</dt><dd><time dateTime={booking.endTime}>{formatStudioDateTime(booking.endTime)}</time></dd></div>
      </dl>
    </section>
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="font-semibold">Thanh toán</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div><dt className="text-stone-400">Tổng tiền</dt><dd>{currency.format(booking.subtotalAmount)}</dd></div>
        <div><dt className="text-stone-400">Tiền cọc</dt><dd>{currency.format(booking.depositAmount)}</dd></div>
        <div><dt className="text-stone-400">Còn lại</dt><dd>{currency.format(booking.remainingAmount)}</dd></div>
        <div><dt className="text-stone-400">Trạng thái thanh toán</dt><dd>{booking.paymentStatus}</dd></div>
      </dl>
    </section>
    {showCustomer && <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
      <h2 className="font-semibold">Thông tin khách hàng</h2>
      <p className="mt-3 text-sm text-stone-300">{booking.customerName} · {booking.customerEmail}{booking.customerPhone ? ` · ${booking.customerPhone}` : ""}</p>
      {booking.note && <p className="mt-2 text-sm text-stone-400">Ghi chú: {booking.note}</p>}
    </section>}
  </div>;
}
