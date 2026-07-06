import { describe, expect, it, vi } from "vitest";

import { createProcessPaymentEvent } from "@/features/payment/application/process-payment-event";

describe("process-payment-event", () => {
  it("delegates normalized event to repository", async () => {
    const repository = {
      processNormalizedEvent: vi.fn().mockResolvedValue({
        status: "PROCESSED",
        bookingId: "11111111-1111-4111-8111-111111111111",
        decision: "SETTLED",
        latePaymentReview: false,
      }),
      getProvider: vi.fn(),
    };
    const event = {
      provider: "SEPAY" as const,
      eventId: "evt-1",
      bookingReference: "11111111-1111-4111-8111-111111111111",
      amount: 240000,
      currency: "VND",
      occurredAt: "2026-07-06T01:00:00.000Z",
      payloadHash: "hash",
      metadata: {},
    };

    const result = await createProcessPaymentEvent(repository)(event);
    expect(repository.processNormalizedEvent).toHaveBeenCalledWith(event);
    expect(result.status).toBe("PROCESSED");
  });
});
