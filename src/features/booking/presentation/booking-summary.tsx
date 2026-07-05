import type { GuestBookingView } from "@/features/booking/application/get-guest-booking";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export function BookingSummary({ booking }: Readonly<{ booking: GuestBookingView }>) {
  return <dl className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2">
    <div><dt className="text-sm text-stone-400">Dịch vụ</dt><dd className="font-semibold">{booking.serviceName}</dd></div>
    <div><dt className="text-sm text-stone-400">Phòng</dt><dd className="font-semibold">{booking.roomName}</dd></div>
    <div><dt className="text-sm text-stone-400">Bắt đầu</dt><dd className="font-semibold">{dateTime.format(new Date(booking.startTime))}</dd></div>
    <div><dt className="text-sm text-stone-400">Tiền cọc 30%</dt><dd className="font-semibold text-amber-300">{money.format(booking.depositAmount)}</dd></div>
  </dl>;
}
