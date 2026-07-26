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

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

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
        <h1 className="display-md">{statusDescription}</h1>
        <p className="confirmation-page__code">
          Mã booking <strong className="type-mono">{booking.id}</strong>
        </p>
      </header>
      <div className="confirmation-receipt booking-ticket ui-surface">
        <p className="booking-ticket__meta type-mono">Biên nhận đặt lịch</p>
        <BookingSummary booking={booking} />
        <PaymentStatus
          bookingStatus={booking.bookingStatus}
          paymentStatus={booking.paymentStatus}
        />
        <section className="confirmation-remaining ui-surface">
          <p className="page-eyebrow">Số tiền còn lại</p>
          <p className="type-mono confirmation-remaining__amount">
            {money.format(booking.remainingAmount)}
          </p>
          <p>Số dư hiện tại của lịch đặt sau khoản tiền cọc.</p>
        </section>
      </div>
      <Link className={actionClassName("primary")} href="/studios">
        Về trang studio
      </Link>
    </section>
  );
}
