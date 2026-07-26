import { redirect } from "next/navigation";

import { PageHeading } from "@/components/ui/page-heading";
import { ClaimBookingsBanner } from "@/features/auth/presentation/claim-bookings-banner";
import { getCurrentActor } from "@/features/auth/application/current-actor";
import { listCustomerBookings } from "@/features/dashboard/application/customer-booking-queries";
import { BookingFilters, BookingPagination, parseBookingStatus, parsePage } from "@/features/dashboard/presentation/booking-filters";
import { CustomerBookingRail } from "@/features/dashboard/presentation/booking-list";

export const dynamic = "force-dynamic";

export default async function AccountBookingsPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?next=/account/bookings");
  const params = await searchParams;
  const status = parseBookingStatus(params.status);
  const result = await listCustomerBookings(actor, { status, page: parsePage(params.page), pageSize: 10 });

  return (
    <section aria-labelledby="bookings-heading" className="account-bookings page-grain">
      <div className="account-page-heading">
        <PageHeading
          description="Theo dõi các lịch đã đặt bằng tài khoản này."
          eyebrow="Tài khoản"
          headingId="bookings-heading"
          title="Booking của tôi"
        />
      </div>
      <ClaimBookingsBanner />
      <BookingFilters action="/account/bookings" status={status} />
      <CustomerBookingRail detailBasePath="/account/bookings" result={result} />
      <BookingPagination basePath="/account/bookings" result={result} status={status} />
    </section>
  );
}
