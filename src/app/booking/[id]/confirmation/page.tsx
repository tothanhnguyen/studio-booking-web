import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { BookingSummary } from "@/features/booking/presentation/booking-summary";
import {
  getPaymentStatusDescription,
  PaymentStatus,
} from "@/features/payment/presentation/payment-status";
import { getPaymentView } from "@/features/payment/application/get-payment-view";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const token = (await cookies()).get(guestCookieName(id))?.value;
  if (!token) notFound();

  const booking = await getPaymentView({ kind: "guest", guestToken: token }, id);
  if (!booking) notFound();
  const statusDescription = getPaymentStatusDescription(
    booking.bookingStatus,
    booking.paymentStatus,
  );

  return (
    <section className="confirmation-page">
      <header className="confirmation-page__header">
        <p className="page-eyebrow">Trạng thái booking</p>
        <h1>{statusDescription}</h1>
        <p className="confirmation-page__code">
          Mã booking <strong className="type-mono">{booking.id}</strong>
        </p>
      </header>
      <div className="confirmation-layout">
        <BookingSummary booking={booking} />
        <aside className="confirmation-layout__rail" aria-label="Bước tiếp theo">
          <PaymentStatus
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
          <section className="confirmation-remaining ui-surface">
            <p className="page-eyebrow">Số tiền còn lại</p>
            <p className="type-mono confirmation-remaining__amount">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(booking.remainingAmount)}
            </p>
            <p>Số dư hiện tại của lịch đặt sau khoản tiền cọc.</p>
          </section>
          <Link className={actionClassName("secondary")} href="/studios">
            Về trang studio
          </Link>
        </aside>
      </div>
    </section>
  );
}
