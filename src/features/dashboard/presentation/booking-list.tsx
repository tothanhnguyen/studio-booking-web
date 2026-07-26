import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { BookingPage } from "@/features/dashboard/application/dashboard-booking-repository";
import { formatStudioDateTime } from "@/features/dashboard/presentation/booking-calendar";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";
import type { RoomMaterial } from "@/features/studio-room/presentation/room-visual";

const STAGGER_STEP_MS = 60;
const STAGGER_CAP_MS = 240;

// Rooms are free-text (admin-authored) so we resolve the material accent by
// keyword rather than slug — mirrors the photo/podcast/music families used
// by RoomVisual, defaulting to the neutral "podcast" family.
function resolveRoomMaterial(roomName: string): RoomMaterial {
  const value = roomName.toLowerCase();
  if (value.includes("photo")) return "photo";
  if (value.includes("music")) return "music";
  return "podcast";
}

const amountFormatter = new Intl.NumberFormat("vi-VN");

/** Compact admin operations list: mono date/time/code/amount columns, hairline dividers. */
export function BookingList({ result, detailBasePath }: Readonly<{ result: BookingPage; detailBasePath: string }>) {
  if (result.items.length === 0) return <p className="admin-empty-state">Chưa có booking phù hợp.</p>;
  return <ul className="admin-row-list">
    {result.items.map((booking) => <li className="admin-row admin-row--booking" key={booking.id}>
      <div className="type-mono admin-row-secondary">
        <time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time>
      </div>
      <div className="type-mono admin-row-secondary">#{booking.id.slice(0, 8)}</div>
      <div className="admin-row-cell">
        <Link className="admin-row-primary" href={`${detailBasePath}/${booking.id}`}>{booking.customerName}</Link>
        <p className="admin-row-secondary">{booking.customerEmail}</p>
      </div>
      <div className="admin-row-cell">
        <p className="admin-row-secondary">{booking.serviceName}</p>
        <p className="admin-row-secondary">{booking.roomName}</p>
      </div>
      <div className="admin-row-cell admin-row-cell--end">
        <p className="admin-row-secondary">Cọc 30%</p>
        <p className="type-mono">{amountFormatter.format(booking.depositAmount)} {booking.currency}</p>
      </div>
      <div className="admin-row-cell admin-row-cell--end">
        <BookingStatusBadge status={booking.bookingStatus} />
      </div>
    </li>)}
  </ul>;
}

/** Customer-facing history rail for /account/bookings — a vertical ticket stack. */
export function CustomerBookingRail({ result, detailBasePath }: Readonly<{ result: BookingPage; detailBasePath: string }>) {
  if (result.items.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={actionClassName("primary")} href="/studios">
            Khám phá studio
          </Link>
        }
        description="Đặt lịch tại một trong các studio của MowStudio để bắt đầu hành trình sáng tạo."
        title="Chưa có booking phù hợp"
      />
    );
  }

  return (
    <ul className="account-ticket-rail">
      {result.items.map((booking, index) => (
        <li key={booking.id}>
          <ScrollReveal delayMs={Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}>
            <article className="account-ticket" data-room-material={resolveRoomMaterial(booking.roomName)}>
              <div className="account-ticket-meta type-mono">
                <time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time>
                <span className="account-ticket-code">#{booking.id.slice(0, 8)}</span>
              </div>
              <div className="account-ticket-body">
                <Link className="account-ticket-service" href={`${detailBasePath}/${booking.id}`}>
                  {booking.serviceName}
                </Link>
                <p className="account-ticket-room">{booking.roomName}</p>
              </div>
              <BookingStatusBadge status={booking.bookingStatus} />
            </article>
          </ScrollReveal>
        </li>
      ))}
    </ul>
  );
}
