"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <main>
          <h1>Đã xảy ra lỗi</h1>
          <p>Hệ thống gặp sự cố ngoài dự kiến. Vui lòng thử lại sau ít phút.</p>
        </main>
      </body>
    </html>
  );
}
