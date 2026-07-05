import { notFound } from "next/navigation";

import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { getAdminBooking } from "@/features/dashboard/application/admin-booking-queries";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const actor = await getAdminPageActor(`/admin/bookings/${id}`);
  const booking = await getAdminBooking(actor, id);
  if (!booking) notFound();
  return <section>
    <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Booking #{booking.id.slice(0, 8)}</p>
    <h1 className="mt-3 text-3xl font-semibold">Chi tiết booking</h1>
    <BookingDetail booking={booking} showCustomer />
  </section>;
}
