import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <p className="font-semibold text-amber-300">Quản trị MowStudio</p>
        <nav aria-label="Điều hướng quản trị" className="mt-5 flex flex-col gap-3 text-sm">
          <Link href="/admin">Tổng quan</Link>
          <Link href="/admin/rooms">Phòng studio</Link>
          <Link href="/admin/services">Dịch vụ</Link>
          <Link href="/admin/schedule">Lịch studio</Link>
          <Link href="/admin/blocked-slots">Slot bị chặn</Link>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
