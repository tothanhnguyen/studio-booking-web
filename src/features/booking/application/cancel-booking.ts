import type { Actor } from "@/features/auth/application/current-actor";
import { UnauthenticatedError } from "@/features/auth/application/require-role";
import { canTransitionBooking } from "@/features/booking/domain/booking-policy";
import { sendBookingNotification } from "@/features/notification/application/notification-service";

const CUSTOMER_CANCEL_HOURS = 24;

export async function cancelBooking(
  actor: Actor | null,
  bookingId: string,
  reason: string,
  now = new Date(),
): Promise<void> {
  if (!actor) throw new UnauthenticatedError();
  if (!reason.trim()) throw new Error("Vui lòng nhập lý do hủy.");

  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      bookingType: true,
      bookingStatus: true,
      paymentStatus: true,
      refundStatus: true,
      startTime: true,
    },
  });
  if (!booking) throw new Error("Booking không tồn tại.");

  if (actor.role !== "ADMIN" && booking.userId !== actor.id) {
    throw new Error("Bạn không có quyền hủy booking này.");
  }

  if (booking.bookingStatus === "CANCELLED") {
    return;
  }

  const cancellationAllowed =
    actor.role === "ADMIN" ||
    booking.startTime.getTime() - now.getTime() >= CUSTOMER_CANCEL_HOURS * 60 * 60 * 1_000;
  if (
    !canTransitionBooking(booking.bookingStatus, "CANCELLED", {
      actorRole: actor.role,
      bookingType: booking.bookingType,
      cancellationAllowed,
      paymentStatus: booking.paymentStatus,
    })
  ) {
    throw new Error("Booking không đủ điều kiện để hủy ở thời điểm hiện tại.");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      bookingStatus: "CANCELLED",
      cancelledAt: now,
      cancellationReason: reason.trim(),
      refundStatus: booking.paymentStatus === "PAID" ? "REQUESTED" : booking.refundStatus,
    },
  });
  await sendBookingNotification({
    bookingId: booking.id,
    eventType: "BOOKING_CANCELLED",
    causalEventId: `cancel:${booking.id}:${actor.id}`,
  });
}
