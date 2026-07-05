import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { getGuestBooking } from "@/features/booking/application/get-guest-booking";
import { BookingSummary } from "@/features/booking/presentation/booking-summary";
import { HoldCountdown } from "@/features/booking/presentation/hold-countdown";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params; const token = (await cookies()).get(guestCookieName(id))?.value;
  if (!token) notFound(); const booking = await getGuestBooking(id, token); if (!booking) notFound();
  return <section className="mx-auto max-w-3xl"><h1 className="text-4xl font-semibold">Thanh toán tiền cọc</h1>{booking.holdExpiresAt && <div className="mt-4"><HoldCountdown expiresAt={booking.holdExpiresAt} /></div>}<div className="mt-6"><BookingSummary booking={booking} /></div><p className="mt-6 text-stone-300">Mã VietQR/SePay sẽ được tích hợp ở Phase 5. Hiện tại đây là trạng thái hướng dẫn thanh toán.</p><Link className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950" href={`/booking/${id}/confirmation`}>Xem xác nhận</Link></section>;
}
