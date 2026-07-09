import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 200 with liveness status without calling dependencies", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("includes the release SHA when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_RELEASE_SHA", "sha-live");
    const response = await GET();

    const body = (await response.json()) as { releaseSha: string };
    expect(body.releaseSha).toBe("sha-live");
  });

  it("falls back to unknown release when SHA is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_RELEASE_SHA", "");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    const response = await GET();

    const body = (await response.json()) as { releaseSha: string };
    expect(body.releaseSha).toBe("unknown");
  });

  it("sets no-store cache headers", async () => {
    const response = await GET();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
