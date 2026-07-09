import { NextResponse } from "next/server";

import { logger } from "@/features/observability/logger";
import { withRequestContextHandler } from "@/features/observability/request-context";
import { createClient } from "@/lib/supabase/server";

export const GET = withRequestContextHandler(async (request) => {
  const url = new URL(request.url); const code = url.searchParams.get("code");
  const next = url.searchParams.get("next"); const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/account/bookings";
  if (code) {
    const { error } = await (await createClient()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
    logger.warn("auth.callback_failed", { cause: String(error) });
  }
  return NextResponse.redirect(new URL("/login?error=callback", url.origin));
});
