import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";

import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";
import type { RoomMaterial } from "@/features/studio-room/presentation/room-visual";
import { STUDIO_TIME_ZONE } from "@/lib/time/studio-time";

export function formatStudioDateTime(isoDate: string) {
  return formatInTimeZone(new Date(isoDate), STUDIO_TIME_ZONE, "dd/MM/yyyy HH:mm");
}

function formatStudioTime(isoDate: string) {
  return formatInTimeZone(new Date(isoDate), STUDIO_TIME_ZONE, "HH:mm");
}

// Rooms are free-text (admin-authored) so the accent family is resolved by
// keyword rather than slug — mirrors BookingList's resolveRoomMaterial and the
// photo/podcast/music families used by RoomVisual, defaulting to "podcast".
function resolveRoomMaterial(roomName: string): RoomMaterial {
  const value = roomName.toLowerCase();
  if (value.includes("photo")) return "photo";
  if (value.includes("music")) return "music";
  return "podcast";
}

/** Admin agenda grouped by day — day headers in mono with a hairline rule,
 * entries as compact rows reusing .admin-row-list/.admin-row with a 3px
 * room-material accent bar (mirrors .account-ticket's convention). */
export function BookingCalendar({ bookings }: Readonly<{ bookings: DashboardBooking[] }>) {
  const grouped = Map.groupBy(bookings, (booking) => formatInTimeZone(new Date(booking.startTime), STUDIO_TIME_ZONE, "yyyy-MM-dd"));
  if (bookings.length === 0) {
    return <p className="admin-empty-state">Không có booking trong khoảng ngày này.</p>;
  }

  return (
    <div aria-label="Lịch booking dạng danh sách" className="admin-agenda">
      {[...grouped.entries()].map(([date, items]) => (
        <section className="admin-agenda-day" key={date}>
          <h2 className="admin-agenda-day-heading type-mono">
            {formatInTimeZone(new Date(items[0]!.startTime), STUDIO_TIME_ZONE, "EEEE, dd/MM/yyyy")}
          </h2>
          <ul className="admin-row-list">
            {items.map((booking) => (
              <li className="admin-row admin-agenda-entry" data-room-material={resolveRoomMaterial(booking.roomName)} key={booking.id}>
                <div className="type-mono admin-agenda-time">
                  {formatStudioTime(booking.startTime)}–{formatStudioTime(booking.endTime)}
                </div>
                <div className="admin-row-cell">
                  <Link className="admin-row-primary" href={`/admin/bookings/${booking.id}`}>
                    {booking.serviceName}
                  </Link>
                  <p className="admin-row-secondary">{booking.customerName} · {booking.roomName}</p>
                </div>
                <BookingStatusBadge status={booking.bookingStatus} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
