import type { ErrorEvent } from "@sentry/nextjs";

import { redact } from "./redact";

/**
 * Shared Sentry init options for every runtime (server, edge, client).
 * Strips request/user PII via the same redaction rules as the logger and tags
 * the release with the deployed commit SHA.
 */
export function buildSentryOptions() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  const release = process.env.NEXT_PUBLIC_RELEASE_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;

  return {
    dsn,
    enabled: Boolean(dsn),
    release,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    beforeSend(event: ErrorEvent): ErrorEvent {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) event.request.headers = redact(event.request.headers) as typeof event.request.headers;
        if (event.request.data) event.request.data = redact(event.request.data);
      }
      if (event.user) event.user = redact(event.user) as typeof event.user;
      if (event.extra) event.extra = redact(event.extra) as typeof event.extra;
      if (event.contexts) event.contexts = redact(event.contexts) as typeof event.contexts;
      return event;
    },
  };
}
