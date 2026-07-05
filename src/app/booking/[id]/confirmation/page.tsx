import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { getGuestBooking } from "@/features/booking/application/get-guest-booking";
import { BookingSummary } from "@/features/booking/presentation/booking-summary";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params; const token = (await cookies()).get(guestCookieName(id))?.value;
  if (!token) notFound(); const booking = await getGuestBooking(id, token); if (!booking) notFound();
  return <section className="mx-auto max-w-3xl"><p className="text-sm uppercase tracking-[0.2em] text-amber-300">Mã booking {booking.id}</p><h1 className="mt-2 text-4xl font-semibold">Đã tạo yêu cầu giữ chỗ</h1><p className="mt-4 text-stone-300">Booking đang chờ thanh toán tiền cọc.</p><div className="mt-6"><BookingSummary booking={booking} /></div></section>;
}
