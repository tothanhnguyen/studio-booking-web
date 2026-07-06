import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { SepayProvider, SepayProviderError } from "@/features/payment/infrastructure/sepay/sepay-provider";

describe("sepay-provider", () => {
  const provider = new SepayProvider({
    bankBin: "970422",
    bankAccountNumber: "0123456789",
    bankAccountName: "Mow Studio",
    webhookSecret: "test-secret",
  });

  it("builds provider-neutral payment instructions", async () => {
    const instructions = await provider.createInstructions({
      bookingReference: "11111111-1111-4111-8111-111111111111",
      amount: 240_000,
      currency: "VND",
    });

    expect(instructions.provider).toBe("SEPAY");
    expect(instructions.transferContent).toContain("BOOKING:11111111-1111-4111-8111-111111111111");
    expect(instructions.qrImageUrl).toContain("img.vietqr.io");
  });

  it("validates signature and normalizes webhook payload", async () => {
    const body = JSON.stringify({
      id: "evt-1",
      amount: 240000,
      currency: "VND",
      content: "Nap coc BOOKING:11111111-1111-4111-8111-111111111111",
      occurred_at: "2026-07-06T01:00:00.000Z",
      account_number: "99998888",
    });
    const signature = createHmac("sha256", "test-secret").update(body, "utf8").digest("hex");
    const request = new Request("http://localhost/api/payments/sepay/webhook", {
      method: "POST",
      body,
      headers: { "content-type": "application/json", "x-sepay-signature": signature },
    });

    const normalized = await provider.verifyAndNormalizeWebhook(request);
    expect(normalized).toMatchObject({
      provider: "SEPAY",
      eventId: "evt-1",
      bookingReference: "11111111-1111-4111-8111-111111111111",
      amount: 240000,
      currency: "VND",
    });
  });

  it("rejects webhook with invalid signature", async () => {
    const request = new Request("http://localhost/api/payments/sepay/webhook", {
      method: "POST",
      body: JSON.stringify({
        id: "evt-1",
        amount: 240000,
        currency: "VND",
        content: "BOOKING:11111111-1111-4111-8111-111111111111",
      }),
      headers: { "x-sepay-signature": "deadbeef" },
    });

    await expect(provider.verifyAndNormalizeWebhook(request)).rejects.toBeInstanceOf(SepayProviderError);
  });
});
