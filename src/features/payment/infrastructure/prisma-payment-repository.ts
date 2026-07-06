import { Prisma } from "@/generated/prisma/client";
import type { PaymentProvider as PrismaPaymentProvider, PrismaClient } from "@/generated/prisma/client";
import { evaluatePaymentResult } from "@/features/payment/application/payment-policy";
import type { PaymentEventResult, PaymentRepository } from "@/features/payment/application/payment-repository";
import type { NormalizedPaymentEvent } from "@/features/payment/domain/payment-types";
import { sendBookingNotification } from "@/features/notification/application/notification-service";

type PendingNotification = Readonly<{
  bookingId: string;
  eventType: "PAYMENT_SUCCEEDED" | "LATE_PAYMENT_REVIEW";
  causalEventId: string;
}> | null;

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly client: PrismaClient) {}

  getProvider(): PrismaPaymentProvider {
    return "SEPAY";
  }

  async processNormalizedEvent(event: NormalizedPaymentEvent): Promise<PaymentEventResult> {
    const processedAt = new Date();
    const eventOccurredAt = new Date(event.occurredAt);
    const processed = await this.client.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: event.bookingReference },
        select: {
          id: true,
          bookingType: true,
          bookingStatus: true,
          paymentStatus: true,
          refundStatus: true,
          holdExpiresAt: true,
          depositAmount: true,
          currency: true,
        },
      });

      try {
        await tx.paymentEvent.create({
          data: {
            provider: "SEPAY",
            eventId: event.eventId,
            bookingId: booking?.id,
            bookingReference: event.bookingReference,
            payloadHash: event.payloadHash,
            occurredAt: eventOccurredAt,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return { result: duplicateResult(booking?.id ?? null), notification: null };
        }
        throw error;
      }

      if (!booking) {
        await tx.paymentEvent.update({
          where: { provider_eventId: { provider: "SEPAY", eventId: event.eventId } },
          data: { processedAt },
        });
        return {
          result: {
            status: "REJECTED",
            bookingId: null,
            decision: "REJECTED",
            latePaymentReview: false,
          } satisfies PaymentEventResult,
          notification: null,
        };
      }

      await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${booking.id}::uuid FOR UPDATE`;
      const payment = await tx.payment.findFirstOrThrow({
        where: { bookingId: booking.id, provider: "SEPAY" },
        orderBy: { createdAt: "desc" },
      });
      await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${payment.id}::uuid FOR UPDATE`;

      const decision = evaluatePaymentResult({
        expectedAmount: payment.requestedAmount,
        expectedCurrency: payment.currency,
        receivedAmount: event.amount,
        receivedCurrency: event.currency,
        referenceMatches: event.bookingReference === booking.id,
        previousPaidAmount: payment.paidAmount,
      });

      const cumulativeAmount = payment.paidAmount + event.amount;
      const isLatePayment =
        booking.bookingStatus === "EXPIRED" ||
        booking.bookingStatus === "CANCELLED" ||
        (booking.bookingStatus === "PENDING_PAYMENT" &&
          booking.holdExpiresAt !== null &&
          booking.holdExpiresAt.getTime() <= processedAt.getTime());

      if (decision === "REJECTED") {
        await tx.paymentEvent.update({
          where: { provider_eventId: { provider: "SEPAY", eventId: event.eventId } },
          data: {
            bookingId: booking.id,
            paymentId: payment.id,
            processedAt,
          },
        });
        return {
          result: {
            status: "REJECTED",
            bookingId: booking.id,
            decision,
            latePaymentReview: false,
          } satisfies PaymentEventResult,
          notification: null,
        };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paidAmount: cumulativeAmount,
          status: decision === "UNDERPAID" ? "PENDING" : "PAID",
          paidAt: decision === "UNDERPAID" ? payment.paidAt : eventOccurredAt,
          providerReference: event.eventId,
          rawPayload: {
            ...(payment.rawPayload as Record<string, unknown> | null),
            lastEventId: event.eventId,
            lastPayloadHash: event.payloadHash,
            transferContent: event.metadata.transferContent ?? null,
            payerAccount: event.metadata.payerAccount ?? null,
          },
        },
      });

      let notification: PendingNotification = null;
      if (decision === "SETTLED" || decision === "OVERPAID_REVIEW") {
        const nextBookingStatus =
          booking.bookingType === "ROOM_ONLY" ? "CONFIRMED" : "PENDING";
        const nextRefundStatus =
          decision === "OVERPAID_REVIEW" || isLatePayment
            ? "REQUESTED"
            : booking.refundStatus;

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "PAID",
            bookingStatus: isLatePayment ? booking.bookingStatus : nextBookingStatus,
            refundStatus: nextRefundStatus,
          },
        });
        notification = {
          bookingId: booking.id,
          eventType: isLatePayment ? "LATE_PAYMENT_REVIEW" : "PAYMENT_SUCCEEDED",
          causalEventId: event.eventId,
        };
      }

      await tx.paymentEvent.update({
        where: { provider_eventId: { provider: "SEPAY", eventId: event.eventId } },
        data: {
          bookingId: booking.id,
          paymentId: payment.id,
          processedAt,
        },
      });

      return {
        result: {
          status: "PROCESSED",
          bookingId: booking.id,
          decision,
          latePaymentReview: isLatePayment,
        } satisfies PaymentEventResult,
        notification,
      };
    });

    if (processed.notification) {
      await sendBookingNotification({
        bookingId: processed.notification.bookingId,
        eventType: processed.notification.eventType,
        causalEventId: processed.notification.causalEventId,
      });
    }

    return processed.result;
  }
}

function duplicateResult(bookingId: string | null): PaymentEventResult {
  return {
    status: "DUPLICATE",
    bookingId,
    decision: null,
    latePaymentReview: false,
  };
}
