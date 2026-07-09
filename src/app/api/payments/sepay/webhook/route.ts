import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/features/observability/logger";
import { getRequestId, withRequestContextHandler } from "@/features/observability/request-context";
import { processPaymentEvent } from "@/features/payment/application/process-payment-event";
import { SepayProviderError } from "@/features/payment/infrastructure/sepay/sepay-provider";
import { createSepayProvider } from "@/features/payment/infrastructure/sepay/sepay-provider-factory";

const noStore = { "Cache-Control": "no-store" };

export const POST = withRequestContextHandler(async (request) => {
  const requestId = getRequestId();
  try {
    const event = await createSepayProvider().verifyAndNormalizeWebhook(request);
    const result = await processPaymentEvent(event);
    logger.info("payment.webhook_processed", { bookingId: event.bookingReference, result });
    return NextResponse.json({ data: result, requestId }, { headers: noStore });
  } catch (error) {
    if (error instanceof SepayProviderError || error instanceof z.ZodError) {
      logger.warn("payment.webhook_rejected", { cause: String(error) });
      return NextResponse.json(
        {
          error: "INVALID_WEBHOOK",
          message: error instanceof SepayProviderError ? error.message : "Webhook payload không hợp lệ.",
          requestId,
        },
        { status: 400, headers: noStore },
      );
    }

    logger.error("payment.webhook_failed", { cause: String(error) });
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Không thể xử lý webhook SePay.",
        requestId,
      },
      { status: 500, headers: noStore },
    );
  }
});
