import Link from "next/link";

import type { BookingPage } from "@/features/dashboard/application/dashboard-booking-repository";
import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";

export function BookingList({ result, detailBasePath }: Readonly<{ result: BookingPage; detailBasePath: string }>) {
  if (result.items.length === 0) return <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text-muted)]">Chưa có booking phù hợp.</p>;
  return <ul className="space-y-4">
    {result.items.map((booking) => <li key={booking.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-lg font-semibold hover:text-[var(--color-action)]" href={`${detailBasePath}/${booking.id}`}>{booking.serviceName}</Link>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{booking.roomName} · <time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time></p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{booking.customerName} · {booking.customerEmail}</p>
        </div>
        <BookingStatusBadge status={booking.bookingStatus} />
      </div>
    </li>)}
  </ul>;
}
