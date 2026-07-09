import { afterEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
  module: {
    setContext: vi.fn(),
    setTag: vi.fn(),
  },
}));

vi.hoisted(() => {
  process.env["NEXT_PUBLIC_SENTRY_DSN"] = "test-sentry-dsn";
});

vi.mock("@sentry/nextjs", () => sentry.module);

import { withRequestContextHandler } from "./request-context";

describe("request-context sentry correlation", () => {
  afterEach(() => {
    sentry.module.setContext.mockReset();
    sentry.module.setTag.mockReset();
  });

  it("attaches the resolved request id to Sentry scope", async () => {
    const handler = withRequestContextHandler(async () => Response.json({ ok: true }));

    await handler(new Request("http://localhost/api/thing", { headers: { "x-request-id": "req-sentry-1" } }));

    expect(sentry.module.setTag).toHaveBeenCalledWith("request_id", "req-sentry-1");
    expect(sentry.module.setContext).toHaveBeenCalledWith("request", { id: "req-sentry-1" });
  });
});
