import { createHash } from "node:crypto";
import { z } from "zod";

import type {
  CreatePaymentInstructionsInput,
  PaymentProvider,
} from "@/features/payment/application/payment-provider";
import type {
  NormalizedPaymentEvent,
  PaymentInstructions,
} from "@/features/payment/domain/payment-types";
import { parseSepayWebhookPayload } from "@/features/payment/infrastructure/sepay/sepay-schema";
import { verifySepaySignature } from "@/features/payment/infrastructure/sepay/sepay-signature";
import { buildVietQrImageUrl } from "@/features/payment/infrastructure/sepay/vietqr";

const BOOKING_REFERENCE_PREFIX = "BOOKING:";

function extractBookingReference(content: string): string | null {
  const match = content.match(/BOOKING:([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

export type SepayProviderConfig = Readonly<{
  bankBin: string;
  bankAccountNumber: string;
  bankAccountName: string;
  webhookSecret?: string;
  transferPrefix?: string;
}>;

export class SepayProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SepayProviderError";
  }
}

export class SepayProvider implements PaymentProvider {
  constructor(private readonly config: SepayProviderConfig) {}

  async createInstructions(
    input: CreatePaymentInstructionsInput,
  ): Promise<PaymentInstructions> {
    const transferContent = `${this.config.transferPrefix ?? BOOKING_REFERENCE_PREFIX}${
      input.bookingReference
    }`;
    return {
      provider: "SEPAY",
      bookingReference: input.bookingReference,
      amount: input.amount,
      currency: input.currency,
      accountNumber: this.config.bankAccountNumber,
      bankBin: this.config.bankBin,
      accountName: this.config.bankAccountName,
      transferContent,
      qrImageUrl: buildVietQrImageUrl({
        bankBin: this.config.bankBin,
        accountNumber: this.config.bankAccountNumber,
        accountName: this.config.bankAccountName,
        amount: input.amount,
        transferContent,
      }),
    };
  }

  async verifyAndNormalizeWebhook(request: Request): Promise<NormalizedPaymentEvent> {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-sepay-signature") ??
      request.headers.get("x-signature");
    const isValid = verifySepaySignature({
      rawBody,
      signatureHeader: signature,
      webhookSecret: this.config.webhookSecret,
    });
    if (!isValid) {
      throw new SepayProviderError("Chữ ký webhook không hợp lệ.");
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      throw new SepayProviderError("Payload webhook không phải JSON hợp lệ.");
    }

    const payload = parseSepayWebhookPayload(parsedBody);
    const transferContent = payload.transfer_content ?? payload.content ?? "";
    const bookingReference = extractBookingReference(transferContent);
    if (!bookingReference) {
      throw new SepayProviderError("Không tìm thấy booking reference trong nội dung chuyển khoản.");
    }

    const eventId = String(payload.transaction_id ?? payload.id ?? "").trim();
    if (!eventId) {
      throw new SepayProviderError("Webhook thiếu transaction identifier.");
    }

    const occurredAt = payload.occurred_at ?? payload.created_at ?? new Date().toISOString();
    const occurredAtParsed = z.iso.datetime().safeParse(occurredAt);
    if (!occurredAtParsed.success) {
      throw new SepayProviderError("Webhook có thời gian không hợp lệ.");
    }

    return {
      provider: "SEPAY",
      eventId,
      bookingReference,
      amount: payload.amount,
      currency: payload.currency,
      occurredAt: occurredAtParsed.data,
      payloadHash: createHash("sha256").update(rawBody, "utf8").digest("hex"),
      metadata: {
        transferContent,
        payerAccount: payload.account_number ?? "",
      },
    };
  }
}
