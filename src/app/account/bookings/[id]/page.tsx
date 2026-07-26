import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { cancelOwnBookingAction } from "@/app/account/bookings/[id]/actions";
import { actionClassName } from "@/components/ui/action";
import { PageHeading } from "@/components/ui/page-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getCurrentActor } from "@/features/auth/application/current-actor";
import { getCustomerBooking } from "@/features/dashboard/application/customer-booking-queries";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";
import { BookingStatusBadge } from "@/features/dashboard/presentation/booking-status-badge";

export const dynamic = "force-dynamic";

export default async function AccountBookingDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?next=/account/bookings");
  const { id } = await params;
  const booking = await getCustomerBooking(actor, id);
  if (!booking) notFound();

  const isCancelled = booking.bookingStatus === "CANCELLED";
  const primaryAction = isCancelled
    ? { href: "/studios", label: "Đặt lịch mới" }
    : { href: "/account/bookings", label: "Xem tất cả booking" };

  return (
    <section className="account-detail page-grain">
      <div className="account-detail-heading">
        <PageHeading eyebrow="Tài khoản" title="Chi tiết booking" />
      </div>

      <ScrollReveal>
        <header className="account-detail-header">
          <div className="account-detail-header-identity">
            <p className="account-detail-code type-mono">#{booking.id.slice(0, 8)}</p>
            <BookingStatusBadge status={booking.bookingStatus} />
          </div>
          <Link className={actionClassName("secondary")} href={primaryAction.href}>
            {primaryAction.label}
          </Link>
        </header>
      </ScrollReveal>

      <BookingDetail booking={booking} />

      {!isCancelled && (
        <ScrollReveal delayMs={160}>
          <form
            action={async (formData) => {
              "use server";
              await cancelOwnBookingAction(booking.id, String(formData.get("reason") ?? ""));
            }}
            className="account-detail-danger"
          >
            <p className="account-detail-danger-label">Hủy booking</p>
            <div className="ui-field account-detail-danger-field">
              <label htmlFor="cancel-reason">Lý do hủy</label>
              <input id="cancel-reason" name="reason" required />
            </div>
            <button className="account-detail-danger-action" type="submit">
              Xác nhận hủy booking này
            </button>
          </form>
        </ScrollReveal>
      )}
    </section>
  );
}
