import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { listAdminBookings } from "@/features/dashboard/application/admin-booking-queries";
import { BookingFilters, BookingPagination, parseBookingStatus, parsePage } from "@/features/dashboard/presentation/booking-filters";
import { BookingList } from "@/features/dashboard/presentation/booking-list";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const actor = await getAdminPageActor("/admin/bookings");
  const params = await searchParams;
  const status = parseBookingStatus(params.status);
  const result = await listAdminBookings(actor, { status, page: parsePage(params.page), pageSize: 20 });
  return (
    <div className="console-view">
      <PageHeading
        description={`${result.total} booking trong bộ lọc hiện tại.`}
        eyebrow="Vận hành"
        headingId="admin-bookings-heading"
        title="Quản lý booking"
      />
      <section aria-labelledby="admin-bookings-list-heading" className="console-section">
        <SectionMarker index={1} label="Danh sách booking" />
        <h2 className="sr-only" id="admin-bookings-list-heading">Danh sách booking</h2>
        <BookingFilters action="/admin/bookings" status={status} />
        <BookingList detailBasePath="/admin/bookings" result={result} />
        <BookingPagination basePath="/admin/bookings" result={result} status={status} />
      </section>
    </div>
  );
}
