import { createHash, randomUUID } from "node:crypto";

import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError, UnauthenticatedError } from "@/features/auth/application/require-role";
import type { PaymentEventResult } from "@/features/payment/application/payment-repository";
import { processPaymentEvent } from "@/features/payment/application/process-payment-event";
import { serverEnv } from "@/lib/env/server";

/**
 * Completes a deposit through the same normalized payment pipeline as a real
 * provider event, but only when the deployment is explicitly in demo mode.
 */
export async function simulateDemoPayment(
  actor: Actor | null,
  bookingId: string,
): Promise<PaymentEventResult> {
  if (!actor) throw new UnauthenticatedError();
  if (actor.role !== "ADMIN") throw new ForbiddenError();
  if (serverEnv.PAYMENT_MODE !== "demo") {
    throw new Error("Demo payment chỉ được phép khi PAYMENT_MODE=demo.");
  }

  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      paymentStatus: true,
      depositAmount: true,
      currency: true,
    },
  });
  if (!booking) throw new Error("Booking không tồn tại.");
  if (booking.paymentStatus === "PAID") {
    throw new Error("Booking này đã được xác nhận thanh toán.");
  }

  const eventId = `demo:${booking.id}:${randomUUID()}`;
  const rawMarker = `${eventId}:${booking.depositAmount}:${booking.currency}`;

  return processPaymentEvent({
    provider: "SEPAY",
    eventId,
    bookingReference: booking.id,
    amount: booking.depositAmount,
    currency: booking.currency,
    occurredAt: new Date().toISOString(),
    payloadHash: createHash("sha256").update(rawMarker, "utf8").digest("hex"),
    metadata: {
      transferContent: `BOOKING:${booking.id}`,
      payerAccount: "demo",
    },
  });
}
