import Link from "next/link";

import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { listAdminBookings } from "@/features/dashboard/application/admin-booking-queries";
import { BookingList } from "@/features/dashboard/presentation/booking-list";

export default async function AdminPage() {
  const recent = await listAdminBookings(await getAdminPageActor(), { page: 1, pageSize: 5 });
  return (
    <div className="admin-view">
      <PageHeading
        description={`Quản lý phòng, dịch vụ và ${recent.total} booking từ đây.`}
        eyebrow="Dashboard"
        headingId="admin-heading"
        title="Tổng quan quản trị"
      />

      <section aria-labelledby="admin-actions-heading" className="admin-section">
        <SectionMarker index={1} label="Thao tác nhanh" />
        <h2 className="sr-only" id="admin-actions-heading">Thao tác nhanh</h2>
        <div className="admin-quick-actions">
          <Link className={actionClassName("primary")} href="/admin/bookings">Xem booking</Link>
          <Link className={actionClassName("secondary")} href="/admin/bookings/calendar">Mở lịch vận hành</Link>
        </div>
      </section>

      <section aria-labelledby="admin-recent-heading" className="admin-section">
        <SectionMarker index={2} label="Booking gần đây" />
        <h2 className="sr-only" id="admin-recent-heading">Booking gần đây</h2>
        <BookingList detailBasePath="/admin/bookings" result={recent} />
      </section>
    </div>
  );
}
