export type PaymentDecision = "SETTLED" | "UNDERPAID" | "OVERPAID_REVIEW" | "REJECTED";

export type SupportedPaymentProvider = "SEPAY";

export type NormalizedPaymentEvent = Readonly<{
  provider: SupportedPaymentProvider;
  eventId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  occurredAt: string;
  payloadHash: string;
  metadata: Readonly<{
    transferContent?: string;
    payerAccount?: string;
  }>;
}>;

export type PaymentInstructions = Readonly<{
  provider: SupportedPaymentProvider;
  bookingReference: string;
  amount: number;
  currency: string;
  accountNumber: string;
  bankBin: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
}>;
