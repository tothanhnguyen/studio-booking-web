import { notFound } from "next/navigation";

import {
  cancelBookingByAdminAction,
  confirmAssistedBookingAction,
  rejectAssistedBookingAction,
  simulateDemoPaymentAction,
  updateRefundStatusAction,
} from "@/app/admin/bookings/[id]/actions";
import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { getAdminBooking } from "@/features/dashboard/application/admin-booking-queries";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";
import { serverEnv } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const actor = await getAdminPageActor(`/admin/bookings/${id}`);
  const booking = await getAdminBooking(actor, id);
  if (!booking) notFound();

  return (
    <div className="console-view">
      <PageHeading eyebrow={`Booking #${booking.id.slice(0, 8)}`} title="Chi tiết booking" />

      <section aria-labelledby="admin-booking-detail-heading" className="console-section">
        <SectionMarker index={1} label="Lịch & thanh toán" />
        <h2 className="sr-only" id="admin-booking-detail-heading">Lịch & thanh toán</h2>
        <BookingDetail booking={booking} showCustomer variant="admin" />
      </section>

      <section aria-labelledby="admin-booking-lifecycle-heading" className="console-section">
        <SectionMarker index={2} label="Thao tác vòng đời" />
        <div className="ui-surface grid gap-4">
          <h2 className="font-semibold" id="admin-booking-lifecycle-heading">Lifecycle actions</h2>

          {serverEnv.PAYMENT_MODE === "demo" && booking.paymentStatus === "PENDING" && (
            <div className="console-actions-group">
              <p className="text-sm text-[var(--color-text-muted)]">
                Chế độ demo: admin có thể xác nhận đã nhận tiền cọc mà không cần SePay webhook thật.
              </p>
              <form
                action={async () => {
                  "use server";
                  await simulateDemoPaymentAction(booking.id);
                }}
              >
                <button className={actionClassName("primary")} type="submit">
                  Mô phỏng thanh toán tiền cọc
                </button>
              </form>
            </div>
          )}

          {booking.bookingType === "ASSISTED" && booking.bookingStatus === "PENDING" && (
            <div className="console-actions-group">
              <form
                action={async () => {
                  "use server";
                  await confirmAssistedBookingAction(booking.id);
                }}
              >
                <button className={actionClassName("primary")} type="submit">
                  Xác nhận booking ASSISTED
                </button>
              </form>
            </div>
          )}

          {booking.bookingStatus !== "CANCELLED" && (
            <div className="console-actions-group">
              <form
                action={async (formData) => {
                  "use server";
                  const reason = String(formData.get("reason") ?? "");
                  if (booking.bookingType === "ASSISTED") {
                    await rejectAssistedBookingAction(booking.id, reason);
                    return;
                  }
                  await cancelBookingByAdminAction(booking.id, reason);
                }}
                className="console-form-field"
              >
                <label className="text-sm text-[var(--color-text-muted)]" htmlFor="admin-cancel-reason">
                  Lý do hủy / từ chối
                </label>
                <input
                  id="admin-cancel-reason"
                  name="reason"
                  required
                  className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-3 text-[var(--color-text)]"
                />
                <button className={`w-fit ${actionClassName("danger")}`} type="submit">
                  {booking.bookingType === "ASSISTED" ? "Từ chối booking" : "Hủy booking"}
                </button>
              </form>
            </div>
          )}

          <div className="console-actions-group">
            <form
              action={async (formData) => {
                "use server";
                await updateRefundStatusAction(
                  booking.id,
                  String(formData.get("status") ?? ""),
                  String(formData.get("note") ?? ""),
                );
              }}
              className="console-form-field"
            >
              <label className="text-sm text-[var(--color-text-muted)]" htmlFor="refund-status">
                Cập nhật refund status
              </label>
              <select
                id="refund-status"
                name="status"
                defaultValue={booking.refundStatus}
                className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-3 text-[var(--color-text)]"
              >
                <option value="REQUESTED">REQUESTED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <input className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-3 text-[var(--color-text)]" name="note" placeholder="Ghi chú hoàn tiền" />
              <button className={`w-fit ${actionClassName("secondary")}`} type="submit">
                Lưu refund status
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
