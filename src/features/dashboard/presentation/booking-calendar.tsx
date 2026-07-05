import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";

import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";
import { STUDIO_TIME_ZONE } from "@/lib/time/studio-time";

export function formatStudioDateTime(isoDate: string) {
  return formatInTimeZone(new Date(isoDate), STUDIO_TIME_ZONE, "dd/MM/yyyy HH:mm");
}

export function BookingCalendar({ bookings }: Readonly<{ bookings: DashboardBooking[] }>) {
  const grouped = Map.groupBy(bookings, (booking) => formatInTimeZone(new Date(booking.startTime), STUDIO_TIME_ZONE, "yyyy-MM-dd"));
  if (bookings.length === 0) return <p className="rounded-2xl border border-white/10 p-6 text-stone-300">Không có booking trong khoảng ngày này.</p>;

  return <div className="grid gap-4 lg:grid-cols-2" aria-label="Lịch booking dạng danh sách">
    {[...grouped.entries()].map(([date, items]) => <section key={date} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="font-semibold text-amber-200">{formatInTimeZone(new Date(items[0]!.startTime), STUDIO_TIME_ZONE, "EEEE, dd/MM/yyyy")}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((booking) => <li key={booking.id} className="rounded-xl bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link className="font-medium hover:text-amber-200" href={`/admin/bookings/${booking.id}`}>
              {formatInTimeZone(new Date(booking.startTime), STUDIO_TIME_ZONE, "HH:mm")} · {booking.serviceName}
            </Link>
            <BookingStatusBadge status={booking.bookingStatus} />
          </div>
          <p className="mt-2 text-sm text-stone-400">{booking.customerName} · {booking.roomName}</p>
        </li>)}
      </ul>
    </section>)}
  </div>;
}
