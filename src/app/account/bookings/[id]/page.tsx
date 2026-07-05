import { notFound, redirect } from "next/navigation";

import { getCurrentActor } from "@/features/auth/application/current-actor";
import { getCustomerBooking } from "@/features/dashboard/application/customer-booking-queries";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";

export const dynamic = "force-dynamic";

export default async function AccountBookingDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?next=/account/bookings");
  const { id } = await params;
  const booking = await getCustomerBooking(actor, id);
  if (!booking) notFound();
  return <section className="mx-auto max-w-4xl">
    <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Booking #{booking.id.slice(0, 8)}</p>
    <h1 className="mt-3 text-3xl font-semibold">Chi tiết booking</h1>
    <BookingDetail booking={booking} />
  </section>;
}
