import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

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
  const servers: Array<ReturnType<typeof createServer>> = [];

  afterEach(async () => {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          }),
      ),
    );
    servers.length = 0;
  });

  async function serve(responses: Record<string, unknown>) {
    const server = createServer((request, response) => {
      const body = responses[request.url ?? "/"];
      if (!body) {
        response.writeHead(404);
        response.end("missing");
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(typeof body === "string" ? body : JSON.stringify(body));
    });
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as AddressInfo;
    return `http://127.0.0.1:${address.port}`;
  }

  it("fails when health release SHA is unknown", async () => {
    const { runSmokeChecks } = await loadSmokeModule();
    const baseUrl = await serve({
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
