import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "./logger";
import { withRequestContext } from "./request-context";

describe("logger", () => {
  let stdout: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdout.mockRestore();
    vi.unstubAllEnvs();
  });

  function lastLine() {
    const call = stdout.mock.calls.at(-1);
    return JSON.parse(String(call?.[0]));
  }

  it("emits valid JSON with level, event and timestamp", () => {
    logger.info("payment.processed", { bookingId: "b1" });

    const line = lastLine();
    expect(line.level).toBe("info");
    expect(line.event).toBe("payment.processed");
    expect(line.bookingId).toBe("b1");
    expect(typeof line.time).toBe("string");
  });

  it("redacts PII fields before writing", () => {
    logger.error("payment.failed", {
      email: "khach@example.com",
      guestToken: "raw-token",
      bookingId: "b1",
    });

    const line = lastLine();
    expect(line.email).toBe("[redacted]");
    expect(line.guestToken).toBe("[redacted]");
    expect(line.bookingId).toBe("b1");
    expect(JSON.stringify(line)).not.toContain("raw-token");
  });

  it("includes the request id from the active context", () => {
    withRequestContext({ requestId: "req-42" }, () => {
      logger.info("test.event", {});
    });

    const line = lastLine();
    expect(line.requestId).toBe("req-42");
  });

  it("tags entries with the release SHA when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_RELEASE_SHA", "sha-abc");
    logger.info("test.event", {});

    expect(lastLine().releaseSha).toBe("sha-abc");
  });
});
