#!/usr/bin/env node
// Guarded production migration runner. Applies pending Prisma migrations using
// the DIRECT (non-pooled) connection. Refuses to run without an explicit
// production confirmation or a direct database URL, keeping migration separate
// from application boot.

import { execFileSync } from "node:child_process";

function fail(message) {
  console.error(`migrate-production: ${message}`);
  process.exit(1);
}

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  fail("DIRECT_URL is required for production migrations (non-pooled connection).");
}

if (!/^postgres(ql)?:\/\//.test(directUrl)) {
  fail("DIRECT_URL must be a PostgreSQL connection string.");
}

// Require an explicit opt-in so this never runs by accident in the wrong place.
const confirm = process.env.MIGRATION_CONFIRM;
if (confirm !== "production") {
  fail('Refusing to migrate: set MIGRATION_CONFIRM="production" to confirm the target.');
}

console.log("migrate-production: applying pending migrations via DIRECT_URL...");

try {
  execFileSync("pnpm", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: directUrl },
  });
} catch {
  // prisma already printed the failure; do not echo connection details.
  fail("prisma migrate deploy failed.");
}

console.log("migrate-production: migrations applied successfully.");
