"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type NavLink = Readonly<{ href: string; label: string }>;
type NavGroup = Readonly<{ eyebrow: string; links: NavLink[] }>;

const OVERVIEW_LINK: NavLink = { href: "/admin", label: "Tổng quan" };

const NAV_GROUPS: NavGroup[] = [
  {
    eyebrow: "Vận hành",
    links: [
      { href: "/admin/bookings", label: "Booking" },
      { href: "/admin/bookings/calendar", label: "Lịch booking" },
    ],
  },
  {
    eyebrow: "Tài chính",
    links: [{ href: "/admin/payments", label: "Payments" }],
  },
  {
    eyebrow: "Cấu hình",
    links: [
      { href: "/admin/rooms", label: "Phòng studio" },
      { href: "/admin/services", label: "Dịch vụ" },
      { href: "/admin/schedule", label: "Lịch studio" },
      { href: "/admin/blocked-slots", label: "Slot bị chặn" },
    ],
  },
];

const ALL_LINKS: NavLink[] = [OVERVIEW_LINK, ...NAV_GROUPS.flatMap((group) => group.links)];

function isLinkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Resolves the single "best" (longest, most specific) matching nav href for a pathname. */
function resolveActiveHref(pathname: string) {
  return ALL_LINKS.filter((link) => isLinkActive(pathname, link.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function navLinkClassName(href: string, activeHref: string | undefined) {
  return `admin-nav-link${href === activeHref ? " admin-nav-link--active" : ""}`;
}

export function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = resolveActiveHref(pathname ?? "/admin");

  return (
    <div className="admin-shell">
      <nav aria-label="Điều hướng quản trị" className="admin-nav">
        <div className="admin-nav-rail">
          <p className="admin-nav-brand">Quản trị MowStudio</p>
          <Link className={navLinkClassName(OVERVIEW_LINK.href, activeHref)} href={OVERVIEW_LINK.href}>
            {OVERVIEW_LINK.label}
          </Link>
          {NAV_GROUPS.map((group) => (
            <div className="admin-nav-group" key={group.eyebrow}>
              <p className="admin-nav-eyebrow">{group.eyebrow}</p>
              {group.links.map((link) => (
                <Link className={navLinkClassName(link.href, activeHref)} href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="admin-nav-mobile">
          <p className="admin-nav-mobile-brand">Quản trị MowStudio</p>
          <select
            aria-label="Điều hướng quản trị"
            className="admin-nav-mobile-select"
            onChange={(event) => router.push(event.target.value)}
            value={activeHref ?? OVERVIEW_LINK.href}
          >
            <option value={OVERVIEW_LINK.href}>{OVERVIEW_LINK.label}</option>
            {NAV_GROUPS.map((group) => (
              <optgroup key={group.eyebrow} label={group.eyebrow}>
                {group.links.map((link) => (
                  <option key={link.href} value={link.href}>
                    {link.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </nav>
      <div className="admin-shell-content">{children}</div>
    </div>
  );
}
