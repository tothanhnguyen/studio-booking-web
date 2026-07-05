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
  return <section aria-labelledby="admin-bookings-heading">
    <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Vận hành</p>
    <h1 id="admin-bookings-heading" className="mt-3 text-3xl font-semibold">Quản lý booking</h1>
    <p className="mt-3 text-stone-300">{result.total} booking trong bộ lọc hiện tại.</p>
    <div className="mt-6"><BookingFilters action="/admin/bookings" status={status} /></div>
    <div className="mt-6"><BookingList result={result} detailBasePath="/admin/bookings" /></div>
    <BookingPagination result={result} basePath="/admin/bookings" status={status} />
  </section>;
}
