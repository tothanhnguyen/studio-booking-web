import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
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

  return (
    <div className="admin-view">
      <PageHeading eyebrow="Asia/Ho_Chi_Minh" headingId="calendar-heading" title="Lịch booking" />

      <form action="/admin/bookings/calendar" className="account-filters">
        <label className="account-filters-label"><span>Từ ngày</span><input className="account-filters-select" type="date" name="from" defaultValue={from} /></label>
        <label className="account-filters-label"><span>Đến ngày</span><input className="account-filters-select" type="date" name="to" defaultValue={to} /></label>
        <button className="ui-action ui-action--primary ui-action--compact">Xem lịch</button>
      </form>

      <section aria-labelledby="calendar-list-heading" className="admin-section">
        <SectionMarker index={1} label="Danh sách theo ngày" />
        <h2 className="sr-only" id="calendar-list-heading">Danh sách theo ngày</h2>
        <BookingCalendar bookings={bookings} />
      </section>
    </div>
  );
}
