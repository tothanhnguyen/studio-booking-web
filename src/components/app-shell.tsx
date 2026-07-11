import type { ReactNode } from "react";
import Link from "next/link";

import type { Actor } from "@/features/auth/application/current-actor";

type AppShellProps = Readonly<{
  actor: Actor | null;
  children: ReactNode;
  onSignOut?: () => Promise<void>;
}>;

const studioLinks = [
  { href: "/studios/photo-studio", label: "Photo" },
  { href: "/studios/voice-podcast-booth", label: "Podcast" },
  { href: "/studios/music-studio", label: "Music" },
] as const;

function AccountActions({ actor, onSignOut }: Pick<AppShellProps, "actor" | "onSignOut">) {
  if (!actor) {
    return (
      <>
        <Link className="site-nav-auth-link" href="/login">Đăng nhập</Link>
        <Link className="site-nav-cta" href="/register">Đăng ký</Link>
      </>
    );
  }

  const accountHref = actor.role === "ADMIN" ? "/admin" : "/account/bookings";
  const accountLabel = actor.role === "ADMIN" ? "Quản trị" : "Booking của tôi";
  return (
    <>
      <Link className="site-nav-auth-link" href={accountHref}>{accountLabel}</Link>
      {actor.email ? <span className="site-nav-email" title={actor.email}>{actor.email}</span> : null}
      <form action={onSignOut}>
        <button className="site-nav-logout">Đăng xuất</button>
      </form>
    </>
  );
}

export function AppShell({ actor, children, onSignOut }: AppShellProps) {
  return (
    <div className="app-shell min-h-screen bg-[#070807] text-stone-100">
      <header className="site-header">
        <div className="site-header-inner">
          <Link aria-label="MOW STUDIO — Trang chủ" className="site-wordmark" href="/">
            <span className="site-wordmark-primary">MOW</span>
            <span className="site-wordmark-divider" aria-hidden="true" />
            <span className="site-wordmark-secondary">STUDIO</span>
          </Link>
          <nav aria-label="Điều hướng studio" className="site-nav">
            <div className="site-room-links">
              {studioLinks.map((link) => (
                <Link href={link.href} key={link.href}>{link.label}</Link>
              ))}
            </div>
            <span className="site-nav-divider" aria-hidden="true" />
            <AccountActions actor={actor} onSignOut={onSignOut} />
          </nav>
        </div>
      </header>
      <main className="app-main mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
