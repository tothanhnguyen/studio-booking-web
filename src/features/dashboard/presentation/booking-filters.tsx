import Link from "next/link";

import type { BookingStatus } from "@/features/booking/domain/booking-types";
import type { BookingPage } from "@/features/dashboard/application/dashboard-booking-repository";
import { getBookingStatusLabel } from "@/features/dashboard/presentation/booking-status-badge";

export const bookingStatuses: BookingStatus[] = ["PENDING_PAYMENT", "PENDING", "CONFIRMED", "CANCELLED", "EXPIRED", "COMPLETED"];

export function parseBookingStatus(value: string | string[] | undefined): BookingStatus | undefined {
  return typeof value === "string" && bookingStatuses.includes(value as BookingStatus) ? value as BookingStatus : undefined;
}

export function parsePage(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function BookingFilters({ action, status }: Readonly<{ action: string; status?: BookingStatus }>) {
  return <form action={action} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <label className="grid gap-1 text-sm"><span className="text-stone-400">Trạng thái</span>
      <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-white/15 bg-stone-900 px-3 py-2">
        <option value="">Tất cả</option>
        {bookingStatuses.map((item) => <option key={item} value={item}>{getBookingStatusLabel(item)}</option>)}
      </select>
    </label>
    <button className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950">Lọc booking</button>
  </form>;
}

export function BookingPagination({ result, basePath, status }: Readonly<{ result: BookingPage; basePath: string; status?: BookingStatus }>) {
  if (result.totalPages <= 1) return null;
  const href = (page: number) => `${basePath}?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page) })}`;
  return <nav aria-label="Phân trang booking" className="mt-6 flex items-center justify-between text-sm">
    {result.page > 1 ? <Link href={href(result.page - 1)}>← Trang trước</Link> : <span />}
    <span className="text-stone-400">Trang {result.page}/{result.totalPages}</span>
    {result.page < result.totalPages ? <Link href={href(result.page + 1)}>Trang sau →</Link> : <span />}
  </nav>;
}
