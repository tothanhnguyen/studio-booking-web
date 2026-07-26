import Link from "next/link";

import { PageHeading } from "@/components/ui/page-heading";
import { SectionMarker } from "@/components/ui/section-marker";
import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const amountFormatter = new Intl.NumberFormat("vi-VN");
const updatedAtFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

// Console status dots for payment/refund tracking — presentational tone
// mapping only, mirrors the LED-status pattern used by BookingStatusBadge.
const paymentTones: Record<string, string> = { PENDING: "pending", PAID: "success", FAILED: "danger", EXPIRED: "expired" };
const refundTones: Record<string, string> = { REQUESTED: "warning", PROCESSING: "info", REFUNDED: "success", REJECTED: "danger" };

function StatusDot({ label, tone }: Readonly<{ label: string; tone?: string }>) {
  return (
    <span className="console-status" data-tone={tone}>
      <span aria-hidden="true" className="console-status__dot" />
      <span className="console-status__label">{label}</span>
    </span>
  );
}

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
    <div className="console-view">
      <PageHeading
        description="Danh sách booking cần đối soát payment/refund."
        eyebrow="Tài chính"
        title="Theo dõi thanh toán & hoàn tiền"
      />

      <section aria-labelledby="admin-payments-heading" className="console-section">
        <SectionMarker index={1} label="Cần đối soát" />
        <h2 className="sr-only" id="admin-payments-heading">Cần đối soát</h2>

        {bookings.length === 0 ? (
          <p className="console-empty-state">Chưa có payment/refund cần theo dõi.</p>
        ) : (
          <div className="console-table">
            <div aria-hidden="true" className="console-table-head console-table-head--payment">
              <span>Booking</span>
              <span>Thanh toán</span>
              <span>Hoàn tiền</span>
              <span className="console-table-head__cell--end">Giá trị</span>
              <span className="console-table-head__cell--end">Cập nhật</span>
            </div>
            <ul className="console-row-list">
              {bookings.map((booking) => (
                <li className="console-row console-row--payment" key={booking.id}>
                  <div className="console-row-cell">
                    <Link className="console-row-primary" href={`/admin/bookings/${booking.id}`}>
                      {booking.serviceName}
                    </Link>
                    <p className="console-row-secondary">{booking.customerName}</p>
                  </div>
                  <StatusDot label={booking.paymentStatus} tone={paymentTones[booking.paymentStatus]} />
                  <StatusDot label={booking.refundStatus} tone={refundTones[booking.refundStatus]} />
                  <div className="type-mono console-row-cell console-row-cell--end">
                    {amountFormatter.format(booking.depositAmount)} {booking.currency}
                  </div>
                  <div className="type-mono console-row-cell console-row-cell--end console-row-secondary">
                    {updatedAtFormatter.format(booking.updatedAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
