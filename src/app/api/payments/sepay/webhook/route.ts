import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { processPaymentEvent } from "@/features/payment/application/process-payment-event";
import { SepayProviderError } from "@/features/payment/infrastructure/sepay/sepay-provider";
import { createSepayProvider } from "@/features/payment/infrastructure/sepay/sepay-provider-factory";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const requestId = randomUUID();
  try {
    const event = await createSepayProvider().verifyAndNormalizeWebhook(request);
    const result = await processPaymentEvent(event);
    return NextResponse.json({ data: result, requestId }, { headers: noStore });
  } catch (error) {
    if (error instanceof SepayProviderError || error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "INVALID_WEBHOOK",
          message: error instanceof SepayProviderError ? error.message : "Webhook payload không hợp lệ.",
          requestId,
        },
        { status: 400, headers: noStore },
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Không thể xử lý webhook SePay.",
        requestId,
      },
      { status: 500, headers: noStore },
    );
  }
}
