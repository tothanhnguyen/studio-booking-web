import type { PaymentDecision } from "@/features/payment/domain/payment-types";

export type PaymentEvaluationInput = Readonly<{
  expectedAmount: number;
  expectedCurrency: string;
  receivedAmount: number;
  receivedCurrency: string;
  referenceMatches: boolean;
  previousPaidAmount: number;
}>;

export function evaluatePaymentResult(input: PaymentEvaluationInput): PaymentDecision {
  if (!input.referenceMatches) {
    return "REJECTED";
  }

  if (input.expectedCurrency !== input.receivedCurrency) {
    return "REJECTED";
  }

  if (!Number.isFinite(input.receivedAmount) || input.receivedAmount <= 0) {
    return "REJECTED";
  }

  if (input.previousPaidAmount >= input.expectedAmount) {
    return "REJECTED";
  }

  const cumulative = input.previousPaidAmount + input.receivedAmount;
  if (cumulative < input.expectedAmount) {
    return "UNDERPAID";
  }

  if (cumulative === input.expectedAmount) {
    return "SETTLED";
  }

  return "OVERPAID_REVIEW";
}
