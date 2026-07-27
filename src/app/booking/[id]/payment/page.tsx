import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { actionClassName } from "@/components/ui/action";
import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { BookingSummary } from "@/features/booking/presentation/booking-summary";
import { HoldCountdown } from "@/features/booking/presentation/hold-countdown";
import { getPaymentView } from "@/features/payment/application/get-payment-view";
import { PaymentStatus } from "@/features/payment/presentation/payment-status";
import { VietQrPayment } from "@/features/payment/presentation/vietqr-payment";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const token = (await cookies()).get(guestCookieName(id))?.value;
  if (!token) notFound();

  const booking = await getPaymentView({ kind: "guest", guestToken: token }, id);
  if (!booking) notFound();

  return (
    <section className="payment-page">
      <header className="payment-page__header">
        <p className="page-eyebrow">Bước thanh toán</p>
        <h1>Thanh toán tiền cọc</h1>
        <p>Quét mã hoặc dùng đúng thông tin chuyển khoản để giữ lịch đặt.</p>
        {booking.holdExpiresAt ? (
          <div className="payment-page__countdown">
            <HoldCountdown expiresAt={booking.holdExpiresAt} />
          </div>
        ) : null}
      </header>
      <div className="booking-receipt">
        <VietQrPayment
          amount={booking.instructions.amount}
          remainingAmount={booking.remainingAmount}
          accountName={booking.instructions.accountName}
          accountNumber={booking.instructions.accountNumber}
          bankBin={booking.instructions.bankBin}
          transferContent={booking.instructions.transferContent}
          qrImageUrl={booking.instructions.qrImageUrl}
        />
        <PaymentStatus
          bookingStatus={booking.bookingStatus}
          paymentStatus={booking.paymentStatus}
        />
        <BookingSummary booking={booking} />
        <Link
          className={actionClassName("primary")}
          href={`/booking/${id}/confirmation`}
        >
          Xem xác nhận
        </Link>
      </div>
    </section>
  );
}
