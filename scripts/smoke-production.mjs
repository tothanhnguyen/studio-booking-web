#!/usr/bin/env node
// Production smoke test: verifies a deployed MowStudio instance answers on its
// critical public surfaces. Usage: node scripts/smoke-production.mjs <baseUrl>

import { pathToFileURL } from "node:url";

const REQUEST_TIMEOUT_MS = 10_000;

export const smokeChecks = [
  {
    path: "/api/health",
    expect: 200,
    json: (body) =>
      body.status === "ok" && typeof body.releaseSha === "string" && body.releaseSha !== "unknown",
  },
  { path: "/api/ready", expect: 200 },
  { path: "/", expect: 200 },
  { path: "/studios", expect: 200 },
  { path: "/studios/photo-studio", expect: 200 },
];

export async function probe(baseUrl, { path, expect: expectedStatus, json }) {
  const url = new URL(path, baseUrl).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "manual" });
    if (response.status !== expectedStatus) {
      return { path, ok: false, detail: `expected ${expectedStatus}, got ${response.status}` };
    }
    if (json) {
      const body = await response.json();
      if (!json(body)) return { path, ok: false, detail: `unexpected body: ${JSON.stringify(body)}` };
    }
    return { path, ok: true };
  } catch (error) {
    return { path, ok: false, detail: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runSmokeChecks(baseUrl) {
  const results = [];
  for (const check of smokeChecks) {
    results.push(await probe(baseUrl, check));
  }
  return results;
}

export async function main(baseUrl) {
  if (!baseUrl) {
    console.error("Usage: node scripts/smoke-production.mjs <baseUrl>");
    process.exit(2);
  }

  const results = await runSmokeChecks(baseUrl);
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.path}${result.detail ? ` — ${result.detail}` : ""}`);
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\nSmoke test failed: ${failed.length}/${results.length} checks did not pass.`);
    process.exit(1);
  }

  console.log(`\nSmoke test passed: ${results.length}/${results.length} checks OK against ${baseUrl}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv[2]);
}
