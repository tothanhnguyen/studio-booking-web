import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError, UnauthenticatedError } from "@/features/auth/application/require-role";
import type { RefundStatus } from "@/generated/prisma/client";

const allowedTransitions: Record<RefundStatus, ReadonlyArray<RefundStatus>> = {
  NONE: ["REQUESTED"],
  REQUESTED: ["PROCESSING", "REFUNDED", "REJECTED"],
  PROCESSING: ["REFUNDED", "REJECTED"],
  REFUNDED: [],
  REJECTED: [],
};

export async function updateRefundStatus(
  actor: Actor | null,
  bookingId: string,
  status: RefundStatus,
  note: string,
): Promise<void> {
  if (!actor) throw new UnauthenticatedError();
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, refundStatus: true, cancellationReason: true },
  });
  if (!booking) throw new Error("Booking không tồn tại.");
  if (booking.refundStatus === status) return;
  if (!allowedTransitions[booking.refundStatus].includes(status)) {
    throw new Error(`Không thể chuyển refund từ ${booking.refundStatus} sang ${status}.`);
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      refundStatus: status,
      cancellationReason: note.trim() || booking.cancellationReason,
    },
  });
}
