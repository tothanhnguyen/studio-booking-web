import { describe, expect, it } from "vitest";

import { evaluatePaymentResult } from "@/features/payment/application/payment-policy";

describe("payment-policy", () => {
  it("returns SETTLED for exact cumulative deposit", () => {
    expect(
      evaluatePaymentResult({
        expectedAmount: 240_000,
        expectedCurrency: "VND",
        receivedAmount: 40_000,
        receivedCurrency: "VND",
        referenceMatches: true,
        previousPaidAmount: 200_000,
      }),
    ).toBe("SETTLED");
  });

  it("returns UNDERPAID when cumulative amount is still below expected", () => {
    expect(
      evaluatePaymentResult({
        expectedAmount: 240_000,
        expectedCurrency: "VND",
        receivedAmount: 100_000,
        receivedCurrency: "VND",
        referenceMatches: true,
        previousPaidAmount: 100_000,
      }),
    ).toBe("UNDERPAID");
  });

  it("returns OVERPAID_REVIEW when cumulative amount exceeds expected", () => {
    expect(
      evaluatePaymentResult({
        expectedAmount: 240_000,
        expectedCurrency: "VND",
        receivedAmount: 50_000,
        receivedCurrency: "VND",
        referenceMatches: true,
        previousPaidAmount: 200_000,
      }),
    ).toBe("OVERPAID_REVIEW");
  });

  it("returns REJECTED for currency/reference mismatch and duplicate cumulative", () => {
    expect(
      evaluatePaymentResult({
        expectedAmount: 240_000,
        expectedCurrency: "VND",
        receivedAmount: 240_000,
        receivedCurrency: "USD",
        referenceMatches: true,
        previousPaidAmount: 0,
      }),
    ).toBe("REJECTED");

    expect(
      evaluatePaymentResult({
        expectedAmount: 240_000,
        expectedCurrency: "VND",
        receivedAmount: 10_000,
        receivedCurrency: "VND",
        referenceMatches: true,
        previousPaidAmount: 240_000,
      }),
    ).toBe("REJECTED");
  });
});
