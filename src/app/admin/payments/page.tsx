import Link from "next/link";

import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const amountFormatter = new Intl.NumberFormat("vi-VN");
const updatedAtFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

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
    <div className="admin-view">
      <PageHeading
        description="Danh sách booking cần đối soát payment/refund."
        eyebrow="Tài chính"
        title="Theo dõi thanh toán & hoàn tiền"
      />

      <section aria-labelledby="admin-payments-heading" className="admin-section">
        <SectionMarker index={1} label="Cần đối soát" />
        <h2 className="sr-only" id="admin-payments-heading">Cần đối soát</h2>

        {bookings.length === 0 ? (
          <p className="admin-empty-state">Chưa có payment/refund cần theo dõi.</p>
        ) : (
          <ul className="admin-row-list">
            {bookings.map((booking) => (
              <li className="admin-row admin-row--payment" key={booking.id}>
                <div className="admin-row-cell">
                  <Link className="admin-row-primary" href={`/admin/bookings/${booking.id}`}>
                    {booking.serviceName}
                  </Link>
                  <p className="admin-row-secondary">{booking.customerName}</p>
                </div>
                <div className="type-mono admin-row-secondary">{booking.paymentStatus}</div>
                <div className="type-mono admin-row-secondary">{booking.refundStatus}</div>
                <div className="type-mono admin-row-cell admin-row-cell--end">
                  {amountFormatter.format(booking.depositAmount)} {booking.currency}
                </div>
                <div className="type-mono admin-row-cell admin-row-cell--end admin-row-secondary">
                  {updatedAtFormatter.format(booking.updatedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
