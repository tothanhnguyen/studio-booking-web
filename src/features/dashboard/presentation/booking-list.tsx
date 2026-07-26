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

/** Console operations table: dense mono date/time/code/amount columns, exposed
 * column rules and an LED status dot per row (see BookingStatusBadge). */
export function BookingList({ result, detailBasePath }: Readonly<{ result: BookingPage; detailBasePath: string }>) {
  if (result.items.length === 0) return <p className="console-empty-state">Chưa có booking phù hợp.</p>;
  return <div className="console-table">
    <div aria-hidden="true" className="console-table-head console-table-head--booking">
      <span>Ngày · Giờ</span>
      <span>Mã</span>
      <span>Khách hàng</span>
      <span>Dịch vụ · Phòng</span>
      <span className="console-table-head__cell--end">Giá trị</span>
      <span className="console-table-head__cell--end">Trạng thái</span>
    </div>
    <ul className="console-row-list">
      {result.items.map((booking) => <li className="console-row console-row--booking" key={booking.id}>
        <div className="type-mono console-row-secondary">
          <time dateTime={booking.startTime}>{formatStudioDateTime(booking.startTime)}</time>
        </div>
        <div className="type-mono console-row-secondary">#{booking.id.slice(0, 8)}</div>
        <div className="console-row-cell">
          <Link className="console-row-primary" href={`${detailBasePath}/${booking.id}`}>{booking.customerName}</Link>
          <p className="console-row-secondary">{booking.customerEmail}</p>
        </div>
        <div className="console-row-cell">
          <p className="console-row-secondary">{booking.serviceName}</p>
          <p className="console-row-secondary">{booking.roomName}</p>
        </div>
        <div className="console-row-cell console-row-cell--end">
          <p className="console-row-secondary">Cọc 30%</p>
          <p className="type-mono">{amountFormatter.format(booking.depositAmount)} {booking.currency}</p>
        </div>
        <div className="console-row-cell console-row-cell--end">
          <BookingStatusBadge status={booking.bookingStatus} />
        </div>
      </li>)}
    </ul>
  </div>;
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
