import type { ReactNode } from "react";
import Link from "next/link";

import type { Actor } from "@/features/auth/application/current-actor";

import { SiteFooter } from "./site-footer";
import { StudioNavigationLinks } from "./studio-navigation";

type AppShellProps = Readonly<{
  actor: Actor | null;
  children: ReactNode;
  onSignOut: () => Promise<void>;
}>;

type NavigationAccountActionsProps = Readonly<{
  actor: Actor | null;
  onSignOut: () => Promise<void>;
}>;

function NavigationAccountActions({ actor, onSignOut }: NavigationAccountActionsProps) {
  if (!actor) {
    return (
      <>
        <Link className="site-nav-auth-link" href="/login">
          Đăng nhập
        </Link>
        <Link className="site-nav-cta" href="/register">
          Đăng ký
        </Link>
      </>
    );
  }

  const accountHref = actor.role === "ADMIN" ? "/admin" : "/account/bookings";
  const accountLabel = actor.role === "ADMIN" ? "Quản trị" : "Booking của tôi";
  return (
    <>
      <Link className="site-nav-auth-link" href={accountHref}>
        {accountLabel}
      </Link>
      {actor.email ? (
        <span className="site-nav-email" title={actor.email}>
          {actor.email}
        </span>
      ) : null}
      <form action={onSignOut}>
        <button className="site-nav-logout">Đăng xuất</button>
      </form>
    </>
  );
}

export function AppShell({ actor, children, onSignOut }: AppShellProps) {
  return (
    <div className="app-shell min-h-screen">
      <header className="site-header">
        <div className="site-header-inner">
          <Link aria-label="MOW STUDIO — Trang chủ" className="site-wordmark" href="/">
            <span className="site-wordmark-primary">MOW</span>
            <span className="site-wordmark-divider" aria-hidden="true" />
            <span className="site-wordmark-secondary">STUDIO</span>
          </Link>
          {/* Both navigation variants stay mounted so CSS can switch layouts without viewport state. */}
          <nav aria-label="Điều hướng studio" className="site-nav">
            <div className="site-room-links">
              <StudioNavigationLinks />
            </div>
            <span className="site-nav-divider" aria-hidden="true" />
            <NavigationAccountActions actor={actor} onSignOut={onSignOut} />
          </nav>
          <details className="site-mobile-menu">
            <summary>Menu</summary>
            <nav aria-label="Điều hướng mobile">
              <StudioNavigationLinks />
              <NavigationAccountActions actor={actor} onSignOut={onSignOut} />
            </nav>
          </details>
        </div>
      </header>
      <main className="app-main mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
