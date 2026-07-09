import { afterEach, describe, expect, it, vi } from "vitest";

const checkDatabaseReady = vi.fn();

vi.mock("@/features/observability/readiness-check", () => ({
  checkDatabaseReady: () => checkDatabaseReady(),
}));

import { GET } from "./route";

describe("GET /api/ready", () => {
  afterEach(() => {
    checkDatabaseReady.mockReset();
  });

  it("returns 200 when the database responds", async () => {
    checkDatabaseReady.mockResolvedValue(true);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe("ready");
  });

  it("returns 503 when the database check times out", async () => {
    checkDatabaseReady.mockRejectedValue(new Error("connect ETIMEDOUT 10.0.0.1:5432"));

    const response = await GET();
    expect(response.status).toBe(503);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe("unavailable");
  });

  it("never leaks connection details on failure", async () => {
    checkDatabaseReady.mockRejectedValue(new Error("connect ETIMEDOUT 10.0.0.1:5432 password=secret"));

    const response = await GET();
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain("10.0.0.1");
    expect(raw).not.toContain("secret");
  });

  it("sets no-store cache headers", async () => {
    checkDatabaseReady.mockResolvedValue(true);
    const response = await GET();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
