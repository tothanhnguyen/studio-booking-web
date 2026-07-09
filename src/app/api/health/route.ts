import { NextResponse } from "next/server";

const noStore = { "Cache-Control": "no-store" };

export const dynamic = "force-dynamic";

/**
 * Liveness probe. Reports process health and release SHA only; never touches
 * the database or any dependency, so it stays 200 during DB outages.
 */
export function GET() {
  const releaseSha =
    process.env.NEXT_PUBLIC_RELEASE_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

  return NextResponse.json({ status: "ok", releaseSha }, { headers: noStore });
}
