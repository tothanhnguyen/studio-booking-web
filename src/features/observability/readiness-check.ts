import "server-only";

import { prisma } from "@/lib/db/prisma";

const READINESS_TIMEOUT_MS = 2_000;

/**
 * Runs a bounded `SELECT 1` against PostgreSQL. Rejects if the database does
 * not respond within the timeout so `/api/ready` can fail fast with a 503.
 */
export async function checkDatabaseReady(): Promise<boolean> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("readiness timeout")), READINESS_TIMEOUT_MS).unref?.();
  });

  await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
  return true;
}
