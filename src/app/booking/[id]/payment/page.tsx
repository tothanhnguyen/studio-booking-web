import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

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
    <section className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold">Thanh toán tiền cọc</h1>
      {booking.holdExpiresAt && (
        <div className="mt-4">
          <HoldCountdown expiresAt={booking.holdExpiresAt} />
        </div>
      )}
      <div className="mt-6">
        <BookingSummary booking={booking} />
      </div>
      <div className="mt-6">
        <PaymentStatus
          bookingStatus={booking.bookingStatus}
          paymentStatus={booking.paymentStatus}
        />
      </div>
      <div className="mt-6">
        <VietQrPayment
          amount={booking.instructions.amount}
          accountName={booking.instructions.accountName}
          accountNumber={booking.instructions.accountNumber}
          bankBin={booking.instructions.bankBin}
          transferContent={booking.instructions.transferContent}
          qrImageUrl={booking.instructions.qrImageUrl}
        />
      </div>
      <Link
        className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950"
        href={`/booking/${id}/confirmation`}
      >
        Xem xác nhận
      </Link>
    </section>
  );
}
