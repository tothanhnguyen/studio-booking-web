import type { PaymentProvider } from "@/generated/prisma/client";
import type { PaymentDecision, NormalizedPaymentEvent } from "@/features/payment/domain/payment-types";

export type PaymentEventResult = Readonly<{
  status: "PROCESSED" | "DUPLICATE" | "REJECTED";
  bookingId: string | null;
  decision: PaymentDecision | null;
  latePaymentReview: boolean;
}>;

export interface PaymentRepository {
  processNormalizedEvent(event: NormalizedPaymentEvent): Promise<PaymentEventResult>;
  getProvider(): PaymentProvider;
}
