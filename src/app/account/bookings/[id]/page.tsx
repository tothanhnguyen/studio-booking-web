import { notFound, redirect } from "next/navigation";

import { cancelOwnBookingAction } from "@/app/account/bookings/[id]/actions";
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
  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
        Booking #{booking.id.slice(0, 8)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Chi tiết booking</h1>
      <BookingDetail booking={booking} />

      {booking.bookingStatus !== "CANCELLED" && (
        <form
          className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          action={async (formData) => {
            "use server";
            await cancelOwnBookingAction(booking.id, String(formData.get("reason") ?? ""));
          }}
        >
          <h2 className="font-semibold">Hủy booking</h2>
          <label className="text-sm text-stone-300" htmlFor="cancel-reason">
            Lý do hủy
          </label>
          <input id="cancel-reason" name="reason" required className="rounded-lg bg-stone-900 p-3" />
          <button
            type="submit"
            className="w-fit rounded-full bg-rose-400 px-4 py-2 font-semibold text-stone-950"
          >
            Xác nhận hủy
          </button>
        </form>
      )}
    </section>
  );
}
