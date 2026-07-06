import type {
  NormalizedPaymentEvent,
  PaymentInstructions,
} from "@/features/payment/domain/payment-types";

export type CreatePaymentInstructionsInput = Readonly<{
  bookingReference: string;
  amount: number;
  currency: string;
}>;

export interface PaymentProvider {
  createInstructions(input: CreatePaymentInstructionsInput): Promise<PaymentInstructions>;
  verifyAndNormalizeWebhook(request: Request): Promise<NormalizedPaymentEvent>;
}
