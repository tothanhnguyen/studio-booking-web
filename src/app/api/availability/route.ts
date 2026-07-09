import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailableSlots, ServiceUnavailableError } from "@/features/availability/application/get-available-slots";
import { logger } from "@/features/observability/logger";
import { getRequestId, withRequestContextHandler } from "@/features/observability/request-context";

const querySchema = z.object({ serviceId: z.uuid(), date: z.iso.date() });
const noStore = { "Cache-Control": "no-store" };

export const GET = withRequestContextHandler(async (request) => {
  const requestId = getRequestId();
  try {
    const url = new URL(request.url);
    const query = querySchema.parse({ serviceId: url.searchParams.get("serviceId"), date: url.searchParams.get("date") });
    const data = await getAvailableSlots({ ...query, now: new Date().toISOString() });
    return NextResponse.json({ data, requestId }, { headers: noStore });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "INVALID_QUERY", message: "serviceId hoặc date không hợp lệ.", requestId }, { status: 400, headers: noStore });
    if (error instanceof ServiceUnavailableError) return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: error.message, requestId }, { status: 404, headers: noStore });
    logger.error("availability.query_failed", { cause: String(error) });
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Không thể tải lịch trống.", requestId }, { status: 500, headers: noStore });
  }
});
