import { notFound } from "next/navigation";

import {
  cancelBookingByAdminAction,
  confirmAssistedBookingAction,
  rejectAssistedBookingAction,
  updateRefundStatusAction,
} from "@/app/admin/bookings/[id]/actions";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { getAdminBooking } from "@/features/dashboard/application/admin-booking-queries";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const actor = await getAdminPageActor(`/admin/bookings/${id}`);
  const booking = await getAdminBooking(actor, id);
  if (!booking) notFound();
  return (
    <section>
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
        Booking #{booking.id.slice(0, 8)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Chi tiết booking</h1>
      <BookingDetail booking={booking} showCustomer />

      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-semibold">Lifecycle actions</h2>

        {booking.bookingType === "ASSISTED" && booking.bookingStatus === "PENDING" && (
          <form
            action={async () => {
              "use server";
              await confirmAssistedBookingAction(booking.id);
            }}
          >
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-stone-950"
            >
              Xác nhận booking ASSISTED
            </button>
          </form>
        )}

        {booking.bookingStatus !== "CANCELLED" && (
          <form
            className="grid gap-2"
            action={async (formData) => {
              "use server";
              const reason = String(formData.get("reason") ?? "");
              if (booking.bookingType === "ASSISTED") {
                await rejectAssistedBookingAction(booking.id, reason);
                return;
              }
              await cancelBookingByAdminAction(booking.id, reason);
            }}
          >
            <label className="text-sm text-stone-300" htmlFor="admin-cancel-reason">
              Lý do hủy / từ chối
            </label>
            <input
              id="admin-cancel-reason"
              name="reason"
              required
              className="rounded-lg bg-stone-900 p-3"
            />
            <button
              type="submit"
              className="w-fit rounded-full bg-rose-400 px-4 py-2 font-semibold text-stone-950"
            >
              {booking.bookingType === "ASSISTED" ? "Từ chối booking" : "Hủy booking"}
            </button>
          </form>
        )}

        <form
          className="grid gap-2"
          action={async (formData) => {
            "use server";
            await updateRefundStatusAction(
              booking.id,
              String(formData.get("status") ?? ""),
              String(formData.get("note") ?? ""),
            );
          }}
        >
          <label className="text-sm text-stone-300" htmlFor="refund-status">
            Cập nhật refund status
          </label>
          <select
            id="refund-status"
            name="status"
            defaultValue={booking.refundStatus}
            className="rounded-lg bg-stone-900 p-3"
          >
            <option value="REQUESTED">REQUESTED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <input name="note" placeholder="Ghi chú hoàn tiền" className="rounded-lg bg-stone-900 p-3" />
          <button
            type="submit"
            className="w-fit rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-950"
          >
            Lưu refund status
          </button>
        </form>
      </div>
    </section>
  );
}
