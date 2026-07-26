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
