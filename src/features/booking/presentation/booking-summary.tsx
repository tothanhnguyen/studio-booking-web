import type { GuestBookingView } from "@/features/booking/application/get-guest-booking";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export function BookingSummary({ booking }: Readonly<{ booking: GuestBookingView }>) {
  return (
    <section className="ticket-stub" aria-labelledby="booking-summary-heading">
      <div className="ticket-stub__head">
        <p className="page-eyebrow">Chi tiết lịch</p>
        <h2 id="booking-summary-heading">Tóm tắt đặt phòng</h2>
      </div>
      <dl className="ticket-stub__body">
        <div className="ticket-stub__row"><dt>Dịch vụ</dt><dd>{booking.serviceName}</dd></div>
        <div className="ticket-stub__row"><dt>Phòng</dt><dd>{booking.roomName}</dd></div>
        <div className="ticket-stub__row">
          <dt>Bắt đầu</dt>
          <dd className="type-mono">{dateTime.format(new Date(booking.startTime))}</dd>
        </div>
      </dl>
      <div className="ticket-stub__total">
        <span>Tiền cọc 30%</span>
        <span className="type-mono">{money.format(booking.depositAmount)}</span>
      </div>
    </section>
  );
}
