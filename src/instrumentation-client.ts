import { buildSentryOptions } from "@/features/observability/sentry-options";

const sentryDsn = process.env["NEXT_PUBLIC_SENTRY_DSN"];
const sentryModulePromise = sentryDsn ? import("@sentry/nextjs") : undefined;

// Chỉ init browser Sentry khi có DSN; local dev không DSN thì bỏ qua.
void sentryModulePromise?.then((Sentry) => Sentry.init(buildSentryOptions()));

export async function onRouterTransitionStart(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRouterTransitionStart>
) {
  return sentryModulePromise?.then((Sentry) => Sentry.captureRouterTransitionStart(...args));
}
