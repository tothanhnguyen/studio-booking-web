import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export type RequestContext = Readonly<{
  requestId: string;
}>;

const storage = new AsyncLocalStorage<RequestContext>();

const TRUSTED_REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;
const sentryDsn = process.env["NEXT_PUBLIC_SENTRY_DSN"] || process.env["SENTRY_DSN"];

/**
 * Runs `callback` with a request-scoped context so downstream services and the
 * logger can correlate every log line and Sentry event to one request id.
 */
export function withRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Derives a request id from a trusted upstream header when it is well-formed,
 * otherwise mints a fresh UUID. Never trusts arbitrary header content.
 */
export function resolveRequestId(headerValue: string | null | undefined): string {
  if (headerValue && TRUSTED_REQUEST_ID_PATTERN.test(headerValue)) {
    return headerValue;
  }
  return randomUUID();
}

/**
 * Wraps a route handler so the whole request runs inside a correlation context.
 * The resolved request id is echoed back in the `x-request-id` response header.
 */
export function withRequestContextHandler(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const requestId = resolveRequestId(request.headers.get("x-request-id"));
    if (sentryDsn) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.setTag("request_id", requestId);
      Sentry.setContext("request", { id: requestId });
    }
    const response = await withRequestContext({ requestId }, () => handler(request));
    response.headers.set("x-request-id", requestId);
    return response;
  };
}
