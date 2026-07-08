import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/features/observability/logger";
import {
  getRequestId,
  resolveRequestId,
  withRequestContextHandler,
} from "@/features/observability/request-context";

describe("request correlation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("propagates one request id from handler through nested async services and logs", async () => {
    const lines: Array<Record<string, unknown>> = [];
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      lines.push(JSON.parse(String(chunk)));
      return true;
    });

    async function innerService() {
      await new Promise((resolve) => setTimeout(resolve, 1));
      logger.info("service.step", { bookingId: "b1" });
      return getRequestId();
    }

    const handler = withRequestContextHandler(async () => {
      const idInsideService = await innerService();
      return Response.json({ idInsideService });
    });

    const response = await handler(
      new Request("http://localhost/api/thing", { headers: { "x-request-id": "req-trace-1" } }),
    );

    expect(response.headers.get("x-request-id")).toBe("req-trace-1");
    const body = (await response.json()) as { idInsideService: string };
    expect(body.idInsideService).toBe("req-trace-1");
    expect(lines).toHaveLength(1);
    expect(lines[0].requestId).toBe("req-trace-1");
    expect(lines[0].event).toBe("service.step");
  });

  it("mints a fresh id when the upstream header is missing or untrusted", () => {
    const generated = resolveRequestId(null);
    expect(generated).toMatch(/^[0-9a-f-]{36}$/);

    const rejected = resolveRequestId("bad id with spaces!");
    expect(rejected).not.toBe("bad id with spaces!");
    expect(rejected).toMatch(/^[0-9a-f-]{36}$/);

    const trusted = resolveRequestId("client-supplied-123");
    expect(trusted).toBe("client-supplied-123");
  });
});
