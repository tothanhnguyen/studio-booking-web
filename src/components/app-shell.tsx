import type { ReactNode } from "react";
import Link from "next/link";

import type { Actor } from "@/features/auth/application/current-actor";

type AppShellProps = Readonly<{
  actor: Actor | null;
  children: ReactNode;
  onSignOut?: () => Promise<void>;
}>;

export function AppShell({ actor, children, onSignOut }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link className="text-lg font-semibold tracking-wide" href="/">MowStudio</Link>
          <nav aria-label="Điều hướng chính" className="flex flex-wrap items-center justify-end gap-4">
            <Link className="text-sm text-stone-300 hover:text-amber-300" href="/studios">Studio</Link>
            {actor ? <>
              <Link className="text-sm text-stone-300 hover:text-amber-300" href={actor.role === "ADMIN" ? "/admin" : "/account/bookings"}>
                {actor.role === "ADMIN" ? "Quản trị" : "Booking của tôi"}
              </Link>
              {actor.email && <span className="max-w-40 truncate text-xs text-stone-500" title={actor.email}>{actor.email}</span>}
              <form action={onSignOut}>
                <button className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-amber-300/50 hover:text-amber-200">Đăng xuất</button>
              </form>
            </> : <>
              <Link className="text-sm text-stone-300 hover:text-amber-300" href="/login">Đăng nhập</Link>
              <Link className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-200" href="/register">Đăng ký</Link>
            </>}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
