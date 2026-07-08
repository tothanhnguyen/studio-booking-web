import { NextResponse } from "next/server";

import { logger } from "@/features/observability/logger";
import { checkDatabaseReady } from "@/features/observability/readiness-check";

const noStore = { "Cache-Control": "no-store" };

export const dynamic = "force-dynamic";

/**
 * Readiness probe. Runs a bounded `SELECT 1` and returns 503 on any failure.
 * Connection details are logged (redacted) but never returned to the caller.
 */
export async function GET() {
  try {
    await checkDatabaseReady();
    return NextResponse.json({ status: "ready" }, { headers: noStore });
  } catch (error) {
    logger.error("readiness.check_failed", { cause: String(error) });
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: noStore });
  }
}
