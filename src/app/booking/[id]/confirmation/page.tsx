import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { CropFrame } from "@/components/ui/crop-frame";
import { LedStatus } from "@/components/ui/led-status";
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
        <p className="confirmation-code">
          Mã booking <strong className="type-mono">{booking.id}</strong>
        </p>
      </header>
      <CropFrame annotation="Biên nhận đặt lịch" className="developed-frame ui-surface">
        <BookingSummary booking={booking} />
        <aside aria-label="Bước tiếp theo" className="confirmation-next">
          <PaymentStatus
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
          <div className="log-row confirmation-remaining" data-state="done">
            <p className="log-row__index">
              <LedStatus label="Còn lại" tone="neutral" />
            </p>
            <p className="log-row__title type-mono">{money.format(booking.remainingAmount)}</p>
          </div>
        </aside>
      </CropFrame>
      <Link className={`${actionClassName("primary")} confirmation-cta`} href="/studios">
        Về trang studio
      </Link>
    </section>
  );
}
