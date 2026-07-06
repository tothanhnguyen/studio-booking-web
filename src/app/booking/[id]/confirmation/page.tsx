import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { BookingSummary } from "@/features/booking/presentation/booking-summary";
import { PaymentStatus } from "@/features/payment/presentation/payment-status";
import { getPaymentView } from "@/features/payment/application/get-payment-view";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const token = (await cookies()).get(guestCookieName(id))?.value;
  if (!token) notFound();

  const booking = await getPaymentView({ kind: "guest", guestToken: token }, id);
  if (!booking) notFound();

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
        Mã booking {booking.id}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">Trạng thái booking</h1>
      <div className="mt-4">
        <PaymentStatus
          bookingStatus={booking.bookingStatus}
          paymentStatus={booking.paymentStatus}
        />
      </div>
      <div className="mt-6">
        <BookingSummary booking={booking} />
      </div>
      <p className="mt-4 text-stone-300">
        Số tiền còn lại khi studio xác nhận lịch:{" "}
        <strong>{new Intl.NumberFormat("vi-VN").format(booking.remainingAmount)} VND</strong>.
      </p>
    </section>
  );
}
