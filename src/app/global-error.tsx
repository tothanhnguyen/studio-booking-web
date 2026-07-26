"use client";

import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (!process.env["NEXT_PUBLIC_SENTRY_DSN"]) return;
    void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
        <main className="mx-auto grid min-h-screen max-w-2xl place-content-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">MowStudio</p>
          <h1 className="text-4xl font-semibold">Đã xảy ra lỗi</h1>
          <p className="text-[var(--color-text-muted)]">Hệ thống gặp sự cố ngoài dự kiến. Vui lòng thử lại sau ít phút.</p>
        </main>
      </body>
    </html>
  );
}
