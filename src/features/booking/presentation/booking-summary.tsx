import type { GuestBookingView } from "@/features/booking/application/get-guest-booking";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export function BookingSummary({ booking }: Readonly<{ booking: GuestBookingView }>) {
  return (
    <section className="booking-summary ui-surface" aria-labelledby="booking-summary-heading">
      <p className="page-eyebrow">Chi tiết lịch</p>
      <h2 id="booking-summary-heading">Tóm tắt đặt phòng</h2>
      <dl>
        <div><dt>Dịch vụ</dt><dd>{booking.serviceName}</dd></div>
        <div><dt>Phòng</dt><dd>{booking.roomName}</dd></div>
        <div>
          <dt>Bắt đầu</dt>
          <dd className="type-mono">{dateTime.format(new Date(booking.startTime))}</dd>
        </div>
        <div>
          <dt>Tiền cọc 30%</dt>
          <dd className="type-mono booking-summary__deposit">{money.format(booking.depositAmount)}</dd>
        </div>
      </dl>
    </section>
  );
}
