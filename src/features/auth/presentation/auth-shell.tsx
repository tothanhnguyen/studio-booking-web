import Image from "next/image";
import type { ReactNode } from "react";

import { SectionMarker } from "@/components/ui/section-marker";

export type AuthShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}>;

const BRAND_STATEMENT = "Một studio duy nhất, đủ không gian cho mọi câu chuyện sáng tạo.";

/**
 * Shared editorial split for /login and /register: form column (5/12) + brand
 * imagery column (7/12) on desktop. Brand column is presentation-only and
 * hides below 1024px so the form remains the sole focus on mobile.
 */
export function AuthShell({ children, description, eyebrow, footer, title }: AuthShellProps) {
  return (
    <section className="auth-split page-grain">
      <div className="auth-split-form">
        <p className="auth-split-wordmark">MOW STUDIO</p>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 className="display-lg">{title}</h1>
        <p className="page-description">{description}</p>
        {children}
        {footer}
      </div>
      <div className="auth-split-brand" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(min-width: 1024px) 58vw, 0px"
          src="/media/brand/auth-statement.webp"
        />
        <div className="auth-split-brand-overlay">
          <p className="display-md auth-split-brand-statement">{BRAND_STATEMENT}</p>
          <SectionMarker index={1} label="MowStudio" />
        </div>
      </div>
    </section>
  );
}
