import type { Actor } from "@/features/auth/application/current-actor";
import type { PaymentInstructions } from "@/features/payment/domain/payment-types";
import { createSepayProvider } from "@/features/payment/infrastructure/sepay/sepay-provider-factory";
import { guestTokenMatches } from "@/lib/security/guest-token";

export type PaymentViewer =
  | Readonly<{ kind: "guest"; guestToken: string }>
  | Readonly<{ kind: "actor"; actor: Actor }>;

export type PaymentView = Readonly<{
  id: string;
  serviceName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  holdExpiresAt: string | null;
  depositAmount: number;
  remainingAmount: number;
  currency: string;
  bookingStatus: string;
  paymentStatus: string;
  instructions: PaymentInstructions;
}>;

export async function getPaymentView(
  viewer: PaymentViewer,
  bookingId: string,
): Promise<PaymentView | null> {
  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      serviceName: true,
      roomName: true,
      startTime: true,
      endTime: true,
      holdExpiresAt: true,
      depositAmount: true,
      remainingAmount: true,
      currency: true,
      bookingStatus: true,
      paymentStatus: true,
      guestAccessTokenHash: true,
    },
  });
  if (!booking) {
    return null;
  }

  const canRead =
    viewer.kind === "guest"
      ? Boolean(
          booking.guestAccessTokenHash &&
            guestTokenMatches(viewer.guestToken, booking.guestAccessTokenHash),
        )
      : booking.userId === viewer.actor.id || viewer.actor.role === "ADMIN";
  if (!canRead) {
    return null;
  }

  const instructions = await createSepayProvider().createInstructions({
    bookingReference: booking.id,
    amount: booking.depositAmount,
    currency: booking.currency,
  });

  return {
    id: booking.id,
    serviceName: booking.serviceName,
    roomName: booking.roomName,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
    depositAmount: booking.depositAmount,
    remainingAmount: booking.remainingAmount,
    currency: booking.currency,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    instructions,
  };
}
