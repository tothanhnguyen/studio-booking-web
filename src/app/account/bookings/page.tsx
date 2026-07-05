import { redirect } from "next/navigation";

import { ClaimBookingsBanner } from "@/features/auth/presentation/claim-bookings-banner";
import { getCurrentActor } from "@/features/auth/application/current-actor";
import { listCustomerBookings } from "@/features/dashboard/application/customer-booking-queries";
import { BookingFilters, BookingPagination, parseBookingStatus, parsePage } from "@/features/dashboard/presentation/booking-filters";
import { BookingList } from "@/features/dashboard/presentation/booking-list";

export const dynamic = "force-dynamic";

export default async function AccountBookingsPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?next=/account/bookings");
  const params = await searchParams;
  const status = parseBookingStatus(params.status);
  const result = await listCustomerBookings(actor, { status, page: parsePage(params.page), pageSize: 10 });

  return <section className="mx-auto max-w-4xl" aria-labelledby="bookings-heading">
    <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Tài khoản</p>
    <h1 id="bookings-heading" className="mt-3 text-3xl font-semibold">Booking của tôi</h1>
    <p className="mt-3 text-stone-300">Theo dõi các lịch đã đặt bằng tài khoản này.</p>
    <div className="mt-6"><ClaimBookingsBanner /></div>
    <div className="mt-6"><BookingFilters action="/account/bookings" status={status} /></div>
    <div className="mt-6"><BookingList result={result} detailBasePath="/account/bookings" /></div>
    <BookingPagination result={result} basePath="/account/bookings" status={status} />
  </section>;
}
