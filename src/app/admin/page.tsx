import Link from "next/link";

import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { listAdminBookings } from "@/features/dashboard/application/admin-booking-queries";

export default async function AdminPage() {
  const recent = await listAdminBookings(await getAdminPageActor(), { page: 1, pageSize: 5 });
  return (
    <section aria-labelledby="admin-heading">
      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Dashboard</p>
      <h1 id="admin-heading" className="mt-3 text-3xl font-semibold">Tổng quan quản trị</h1>
      <p className="mt-4 text-stone-300">Quản lý phòng, dịch vụ và {recent.total} booking từ đây.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950" href="/admin/bookings">Xem booking</Link>
        <Link className="rounded-full border border-white/15 px-4 py-2 text-sm" href="/admin/bookings/calendar">Mở lịch vận hành</Link>
      </div>
    </section>
  );
}
