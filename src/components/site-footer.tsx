import Link from "next/link";

import { StudioNavigationLinks } from "./studio-navigation";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-wordmark">MOW</p>
        <nav aria-label="Điều hướng chân trang" className="site-footer-links">
          <StudioNavigationLinks />
        </nav>
        <Link className="site-footer-cta" href="/studios">
          Đặt lịch
        </Link>
      </div>
      <p className="site-footer-location">Sài Gòn · Asia/Ho_Chi_Minh</p>
    </footer>
  );
}
