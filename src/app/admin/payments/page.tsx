import Link from "next/link";

import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await getAdminPageActor("/admin/payments");
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { paymentStatus: "PAID" },
        { refundStatus: { in: ["REQUESTED", "PROCESSING", "REJECTED"] } },
      ],
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    select: {
      id: true,
      serviceName: true,
      customerName: true,
      paymentStatus: true,
      refundStatus: true,
      depositAmount: true,
      currency: true,
      updatedAt: true,
    },
  });

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Tài chính</p>
      <h1 className="mt-3 text-3xl font-semibold">Theo dõi thanh toán & hoàn tiền</h1>
      <p className="mt-2 text-stone-300">Danh sách booking cần đối soát payment/refund.</p>
      <ul className="mt-6 space-y-3">
        {bookings.map((booking) => (
          <li key={booking.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/admin/bookings/${booking.id}`} className="font-semibold hover:text-amber-200">
                  {booking.serviceName}
                </Link>
                <p className="text-sm text-stone-400">{booking.customerName}</p>
              </div>
              <div className="text-right text-sm">
                <p>Payment: <strong>{booking.paymentStatus}</strong></p>
                <p>Refund: <strong>{booking.refundStatus}</strong></p>
                <p className="text-stone-400">
                  {new Intl.NumberFormat("vi-VN").format(booking.depositAmount)} {booking.currency}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {bookings.length === 0 && (
        <p className="mt-6 rounded-2xl border border-white/10 p-5 text-stone-300">Chưa có payment/refund cần theo dõi.</p>
      )}
    </section>
  );
}
