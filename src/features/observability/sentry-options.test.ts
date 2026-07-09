import { afterEach, describe, expect, it, vi } from "vitest";

import { buildSentryOptions } from "./sentry-options";

describe("buildSentryOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the browser-safe public DSN when configured", () => {
    vi.stubEnv("SENTRY_DSN", "server-dsn");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "public-dsn");

    expect(buildSentryOptions().dsn).toBe("public-dsn");
  });
});
