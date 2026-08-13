import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

type SmokeCheck = Readonly<{ path: string; expect: number; json?: (body: Record<string, unknown>) => boolean }>;
type SmokeResult = Readonly<{ path: string; ok: boolean; detail?: string }>;
type SmokeModule = Readonly<{
  runSmokeChecks: (baseUrl: string) => Promise<SmokeResult[]>;
  smokeChecks: SmokeCheck[];
}>;

async function loadSmokeModule(): Promise<SmokeModule> {
  const moduleUrl = new URL("scripts/smoke-production.mjs", pathToFileURL(`${process.cwd()}/`)).href;
  return import(moduleUrl) as Promise<unknown> as Promise<SmokeModule>;
}

describe("production smoke checks", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function serve(responses: Record<string, unknown>) {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const requestUrl = input instanceof Request ? input.url : input.toString();
      const body = responses[new URL(requestUrl).pathname];
      if (!body) {
        return new Response("missing", { status: 404 });
      }
      return new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    return "https://mowstudio.test";
  }

  it("fails when health release SHA is unknown", async () => {
    const { runSmokeChecks } = await loadSmokeModule();
    const baseUrl = serve({
      "/": "ok",
      "/api/health": { status: "ok", releaseSha: "unknown" },
      "/api/ready": { status: "ready" },
      "/studios": "ok",
      "/studios/photo-studio": "ok",
    });

    const results = await runSmokeChecks(baseUrl);

    expect(results.find((result) => result.path === "/api/health")?.ok).toBe(false);
  });

  it("checks a seeded public studio detail route", async () => {
    const { smokeChecks } = await loadSmokeModule();

    expect(smokeChecks.map((check) => check.path)).toContain("/studios/photo-studio");
  });
});
