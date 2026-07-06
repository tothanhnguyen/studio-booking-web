import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError, UnauthenticatedError } from "@/features/auth/application/require-role";
import { canTransitionBooking } from "@/features/booking/domain/booking-policy";
import { sendBookingNotification } from "@/features/notification/application/notification-service";

export async function confirmAssistedBooking(
  actor: Actor | null,
  bookingId: string,
): Promise<void> {
  if (!actor) throw new UnauthenticatedError();
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingType: true,
      bookingStatus: true,
      paymentStatus: true,
    },
  });
  if (!booking) throw new Error("Booking không tồn tại.");
  if (booking.bookingType !== "ASSISTED") {
    throw new Error("Chỉ booking ASSISTED mới cần xác nhận thủ công.");
  }
  if (booking.bookingStatus === "CONFIRMED") {
    return;
  }

  if (
    !canTransitionBooking(booking.bookingStatus, "CONFIRMED", {
      actorRole: actor.role,
      bookingType: booking.bookingType,
      cancellationAllowed: false,
      paymentStatus: booking.paymentStatus,
    })
  ) {
    throw new Error("Booking chưa đủ điều kiện để xác nhận.");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: "CONFIRMED" },
  });
  await sendBookingNotification({
    bookingId: booking.id,
    eventType: "BOOKING_CONFIRMED",
    causalEventId: `confirm:${booking.id}`,
  });
}

export async function rejectAssistedBooking(
  actor: Actor | null,
  bookingId: string,
  reason: string,
): Promise<void> {
  if (!actor) throw new UnauthenticatedError();
  if (actor.role !== "ADMIN") throw new ForbiddenError();
  if (!reason.trim()) throw new Error("Vui lòng nhập lý do từ chối.");

  const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, bookingStatus: true, paymentStatus: true },
  });
  if (!booking) throw new Error("Booking không tồn tại.");
  if (booking.bookingStatus === "CANCELLED") return;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      bookingStatus: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: reason.trim(),
      refundStatus: booking.paymentStatus === "PAID" ? "REQUESTED" : "NONE",
    },
  });
  await sendBookingNotification({
    bookingId: booking.id,
    eventType: "BOOKING_CANCELLED",
    causalEventId: `reject:${booking.id}`,
  });
}
