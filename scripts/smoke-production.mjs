#!/usr/bin/env node
// Production smoke test: verifies a deployed MowStudio instance answers on its
// critical public surfaces. Usage: node scripts/smoke-production.mjs <baseUrl>

const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error("Usage: node scripts/smoke-production.mjs <baseUrl>");
  process.exit(2);
}

const REQUEST_TIMEOUT_MS = 10_000;

const checks = [
  { path: "/api/health", expect: 200, json: (body) => body.status === "ok" },
  { path: "/api/ready", expect: 200 },
  { path: "/", expect: 200 },
  { path: "/studios", expect: 200 },
];

async function probe({ path, expect: expectedStatus, json }) {
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

const results = [];
for (const check of checks) {
  const result = await probe(check);
  results.push(result);
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.path}${result.detail ? ` — ${result.detail}` : ""}`);
}

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  console.error(`\nSmoke test failed: ${failed.length}/${results.length} checks did not pass.`);
  process.exit(1);
}

console.log(`\nSmoke test passed: ${results.length}/${results.length} checks OK against ${baseUrl}`);
