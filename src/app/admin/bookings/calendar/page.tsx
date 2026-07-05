import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { getAdminCalendar } from "@/features/dashboard/application/admin-booking-queries";
import { BookingCalendar } from "@/features/dashboard/presentation/booking-calendar";
import { STUDIO_TIME_ZONE, toUtcFromStudioLocal } from "@/lib/time/studio-time";

export const dynamic = "force-dynamic";

function readDate(value: string | string[] | undefined, fallback: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  try { toUtcFromStudioLocal(value, "00:00"); return value; } catch { return fallback; }
}

export default async function AdminBookingCalendarPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const actor = await getAdminPageActor("/admin/bookings/calendar");
  const today = new Date();
  const defaultFrom = formatInTimeZone(today, STUDIO_TIME_ZONE, "yyyy-MM-dd");
  const defaultTo = formatInTimeZone(addDays(today, 6), STUDIO_TIME_ZONE, "yyyy-MM-dd");
  const params = await searchParams;
  const from = readDate(params.from, defaultFrom);
  let to = readDate(params.to, defaultTo);
  if (to < from) to = from;
  const rangeStart = toUtcFromStudioLocal(from, "00:00");
  const maximumTo = formatInTimeZone(addDays(rangeStart, 91), STUDIO_TIME_ZONE, "yyyy-MM-dd");
  if (to > maximumTo) to = maximumTo;
  const rangeEnd = addDays(toUtcFromStudioLocal(to, "00:00"), 1);
  const bookings = await getAdminCalendar(actor, { from: rangeStart, to: rangeEnd });

  return <section aria-labelledby="calendar-heading">
    <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Asia/Ho_Chi_Minh</p>
    <h1 id="calendar-heading" className="mt-3 text-3xl font-semibold">Lịch booking</h1>
    <form action="/admin/bookings/calendar" className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 p-4">
      <label className="grid gap-1 text-sm"><span className="text-stone-400">Từ ngày</span><input className="rounded-lg border border-white/15 bg-stone-900 px-3 py-2" type="date" name="from" defaultValue={from} /></label>
      <label className="grid gap-1 text-sm"><span className="text-stone-400">Đến ngày</span><input className="rounded-lg border border-white/15 bg-stone-900 px-3 py-2" type="date" name="to" defaultValue={to} /></label>
      <button className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950">Xem lịch</button>
    </form>
    <div className="mt-6"><BookingCalendar bookings={bookings} /></div>
  </section>;
}
