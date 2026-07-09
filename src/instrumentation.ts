// Chỉ nạp Sentry server/edge config khi có DSN (production/preview). Ở local dev
// không có DSN, việc init Sentry là vô ích và có thể làm Turbopack dev server
// thoát ngay sau khi Ready, nên bỏ qua hoàn toàn.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

let captureRequestError: typeof import("@sentry/nextjs").captureRequestError | undefined;

export async function register() {
  if (!sentryDsn) return;
  const Sentry = await import("@sentry/nextjs");
  captureRequestError = Sentry.captureRequestError;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export function onRequestError(...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>) {
  return captureRequestError?.(...args);
}
